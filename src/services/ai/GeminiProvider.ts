import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIProvider } from './IAIProvider';
import { globalApiQueue } from '../apiQueue';
import { defaultGenerationConfig, deepGenerationConfig, MODEL_DEEP } from '../config';
import { RateLimitError, ValidationError, NetworkError } from './AgentError';
import { Logger } from '../../utils/logger';

export class GeminiProvider implements IAIProvider {
  /** Extract the first complete JSON array or object from a raw string */
  private extractJson(raw: string): string {
    // Strip markdown code fences
    let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Find the first opening bracket/brace
    const firstBracket = text.search(/[[{]/);
    if (firstBracket === -1) throw new SyntaxError('No JSON structure found in response');
    text = text.slice(firstBracket);

    // Walk the string counting brackets to find the matching close
    const opener = text[0];
    const closer = opener === '[' ? ']' : '}';
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (!inString) {
        if (ch === opener) depth++;
        else if (ch === closer) {
          depth--;
          if (depth === 0) return text.slice(0, i + 1);
        }
      }
    }
    // Truncated response — throw informative error
    throw new SyntaxError(`JSON was truncated by the API (depth=${depth} after ${text.length} chars). Raw: "${text.slice(0, 80)}…"`);
  }

  public async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>, modelName: string, retryCount = 0): Promise<T> {
    try {
      const genConfig = modelName === MODEL_DEEP ? deepGenerationConfig : defaultGenerationConfig;
      const result = await globalApiQueue.enqueue(prompt, modelName, async (apiKey) => {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: genConfig
        });
        return model.generateContent(prompt);
      });

      const text = result.response.text();
      Logger.ai(`Raw response (${text.length} chars): ${text.slice(0, 120)}…`);

      try {
        const cleanJson = this.extractJson(text);
        const parsed = JSON.parse(cleanJson);
        const validated = schema.parse(parsed);
        return validated;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        Logger.error(`JSON parse/validate failed (attempt ${retryCount + 1}): ${message}`);
        if (retryCount < 1) {
          const fixPrompt = `${prompt}\n\nCRITICAL: Your previous response was invalid JSON. Respond ONLY with a single valid, complete JSON ${text.trim().startsWith('[') ? 'array' : 'object'}. No markdown, no explanation, no trailing text. Error was: ${message}`;
          return this.generateStructured(fixPrompt, schema, modelName, retryCount + 1);
        }
        throw new ValidationError(`Validation failed after retry: ${message}`);
      }
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;

      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMessage.toLowerCase().includes('429') ||
                          errorMessage.toLowerCase().includes('quota') ||
                          (typeof error === 'object' && error !== null && 'status' in error && (error as { status: unknown }).status === 429);

      if (isRateLimit) {
        // Try to extract retry-after from error response
        let retryAfter: number | undefined;
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const response = (error as { response?: { headers?: { 'retry-after'?: string } } }).response;
          if (response?.headers?.['retry-after']) {
            retryAfter = parseInt(response.headers['retry-after'], 10) * 1000; // Convert to ms
          }
        }
        // Default to 60 seconds if no retry-after header
        if (!retryAfter) retryAfter = 60000;
        
        Logger.error('Gemini API failed (429) - Quota Exceeded');
        throw new RateLimitError(errorMessage || 'API Quota Exceeded. Please retry in a few minutes.', retryAfter);
      }

      Logger.error(`Gemini API error: ${errorMessage}`);
      throw new NetworkError(errorMessage || 'Network error connecting to AI provider');
    }
  }

  public async generateStream(prompt: string, modelName: string, onChunk: (text: string) => void): Promise<void> {
    // Route through apiQueue for: key rotation, throttling, 429 retry, and in-memory caching
    // We accumulate chunks into a full text, cache it, then stream it to the caller
    const result = await globalApiQueue.enqueue(prompt, modelName, async (apiKey) => {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048, // Rich stories — 2048 tokens ≈ 1500 words
        },
      });

      try {
        const streamResult = await model.generateContentStream(prompt);
        let fullText = '';
        for await (const chunk of streamResult.stream) {
          fullText += chunk.text();
        }
        // Return the full text as a mock "response" object so apiQueue can cache it
        return { text: fullText };
      } catch (error: any) {
        Logger.error(`Story stream failed: ${error.message}`);
        throw error;
      }
    });

    // Deliver the cached/fresh text as a single chunk (the UI handles its own animation)
    if (result?.text) {
      onChunk(result.text);
    }
  }
}
