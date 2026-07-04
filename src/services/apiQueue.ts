import { getGeminiApiKeys } from './config';
import { Logger } from '../utils/logger';

interface QueueItem<T> {
  taskFn: (apiKey: string) => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  retries: number;
  hash: string;
}

const DELAY_MS = 700;  // ~700ms gap between requests; safe with key rotation
const MAX_RETRIES = 3;
const RETRY_BACKOFF = [2000, 5000, 10000];

class APIQueue {
  private queue: QueueItem<unknown>[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private currentKeyIndex = 0;
  private keys: string[] = [];
  private cache: Record<string, unknown> = {};

  constructor() {
    this.keys = getGeminiApiKeys();
  }

  private getCurrentKey(): string {
    if (this.keys.length === 0) return '';
    return this.keys[this.currentKeyIndex];
  }

  private rotateKey() {
    if (this.keys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
      Logger.cache(`Rotated API key to index ${this.currentKeyIndex}`);
    }
  }

  // Simple string hasher for deduplication
  public static hashRequest(prompt: string, model: string): string {
    let str = `${model}:${prompt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  public enqueue<T>(prompt: string, model: string, taskFn: (apiKey: string) => Promise<T>): Promise<T> {
    const hash = APIQueue.hashRequest(prompt, model);

    // Return cached if exists
    if (this.cache[hash]) {
      Logger.cache(`Returning cached result for ${model}`);
      return Promise.resolve(this.cache[hash] as T);
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve: resolve as any, reject: reject as any, retries: 0, hash });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue.shift()!;

    // Enforce delay buffer
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < DELAY_MS) {
      await new Promise(r => setTimeout(r, DELAY_MS - timeSinceLast));
    }

    try {
      const apiKey = this.getCurrentKey();
      if (!apiKey) {
        throw new Error('No API Key provided');
      }

      this.lastRequestTime = Date.now();
      const result = await item.taskFn(apiKey);
      
      // Cache successful result
      this.cache[item.hash] = result;
      item.resolve(result);

    } catch (error) {
      const isRateLimit = error instanceof Error
        ? error.message.toLowerCase().includes('429') ||
          error.message.toLowerCase().includes('quota')
        : false;
      const hasStatus429 = typeof error === 'object' && error !== null && 'status' in error && (error as { status: unknown }).status === 429;
      
      if ((isRateLimit || hasStatus429) && item.retries < MAX_RETRIES) {
        this.rotateKey(); // Switch key immediately
        
        const backoff = RETRY_BACKOFF[item.retries] || RETRY_BACKOFF[RETRY_BACKOFF.length - 1];
        Logger.retry(`Rate limit hit (429). Retrying in ${backoff}ms... (Retry ${item.retries + 1}/${MAX_RETRIES})`);
        
        item.retries++;
        
        // Push back to front of queue
        this.queue.unshift(item);
        
        // Wait before processing again
        await new Promise(r => setTimeout(r, backoff));
      } else {
        item.reject(error);
      }
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }
}

export const globalApiQueue = new APIQueue();
