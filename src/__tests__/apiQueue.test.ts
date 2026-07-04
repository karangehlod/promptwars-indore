import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalApiQueue } from '../services/apiQueue';
import * as config from '../services/config';

describe('API Queue', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should process requests sequentially and apply delay', async () => {
    vi.spyOn(config, 'getGeminiApiKeys').mockReturnValue(['key1']);
    const queue = new (globalApiQueue.constructor as any)();
    queue.keys = ['key1']; // Manually inject for test
    
    let executions: number[] = [];
    
    const task1 = vi.fn().mockImplementation(async () => {
      executions.push(Date.now());
      return 'res1';
    });
    
    const task2 = vi.fn().mockImplementation(async () => {
      executions.push(Date.now());
      return 'res2';
    });

    const p1 = queue.enqueue('prompt1', 'model1', task1);
    const p2 = queue.enqueue('prompt2', 'model2', task2);

    await vi.runAllTimersAsync();
    
    const res1 = await p1;
    const res2 = await p2;

    expect(res1).toBe('res1');
    expect(res2).toBe('res2');
    expect(task1).toHaveBeenCalledTimes(1);
    expect(task2).toHaveBeenCalledTimes(1);
  });

  it('should rotate keys on 429 rate limit error', async () => {
    vi.spyOn(config, 'getGeminiApiKeys').mockReturnValue(['key1', 'key2']);
    const queue = new (globalApiQueue.constructor as any)();
    queue.keys = ['key1', 'key2'];
    queue.currentKeyIndex = 0;

    let attempts = 0;
    const failingTask = vi.fn().mockImplementation(async (key: string) => {
      attempts++;
      if (attempts === 1) {
        expect(key).toBe('key1');
        const err = new Error('Quota exceeded 429');
        (err as any).status = 429;
        throw err;
      }
      expect(key).toBe('key2');
      return 'success';
    });

    const p = queue.enqueue('prompt', 'model', failingTask);
    
    // Fast-forward timers for exponential backoff (2000ms)
    await vi.runAllTimersAsync();
    
    const res = await p;
    expect(res).toBe('success');
    expect(attempts).toBe(2);
    expect(queue.currentKeyIndex).toBe(1);
  });

  it('should return cached response for duplicate requests', async () => {
    const queue = new (globalApiQueue.constructor as any)();
    queue.keys = ['key1'];
    
    const task = vi.fn().mockResolvedValue('success');
    
    queue.enqueue('duplicate_prompt', 'model', task);
    await vi.runAllTimersAsync();
    
    // Second call with same parameters
    const res2 = await queue.enqueue('duplicate_prompt', 'model', task);
    
    expect(res2).toBe('success');
    expect(task).toHaveBeenCalledTimes(1); // Cache hit, task shouldn't be called again
  });
});
