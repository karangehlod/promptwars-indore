import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIProvider } from './IAIProvider';
import { globalApiQueue } from '../apiQueue';
import { defaultGenerationConfig, deepGenerationConfig, getGeminiApiKeys, MODEL_DEEP } from '../config';
import { AgentError, RateLimitError, ValidationError, NetworkError } from './AgentError';
import { Logger } from '../../utils/logger';

export class GeminiProvider implements IAIProvider {
  /** Extract the first complete JSON array or object from a raw string */
  private extractJson(raw: string): string {
    // Strip markdown code fences
    let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Find the first opening bracket/brace
    const firstBracket = text.search(/[\[{]/);
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
      } catch (e: any) {
        Logger.error(`JSON parse/validate failed (attempt ${retryCount + 1}): ${e.message}`);
        if (retryCount < 1) {
          const fixPrompt = `${prompt}\n\nCRITICAL: Your previous response was invalid JSON. Respond ONLY with a single valid, complete JSON ${text.trim().startsWith('[') ? 'array' : 'object'}. No markdown, no explanation, no trailing text. Error was: ${e.message}`;
          return this.generateStructured(fixPrompt, schema, modelName, retryCount + 1);
        }
        throw new ValidationError(`Validation failed after retry: ${e.message}`);
      }
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;

      const isRateLimit = error.message?.toLowerCase().includes('429') ||
                          error.message?.toLowerCase().includes('quota') ||
                          error.status === 429;

      if (isRateLimit) {
        Logger.error('Gemini API failed (429) - Quota Exceeded');
        throw new RateLimitError(error.message || 'API Quota Exceeded');
      }

      Logger.error(`Gemini API error: ${error.message}`);
      throw new NetworkError(error.message || 'Network error connecting to AI provider');
    }
  }

  public async generateStream(prompt: string, modelName: string, onChunk: (text: string) => void): Promise<void> {
    const keys = getGeminiApiKeys();
    const apiKey = keys.length > 0 ? keys[0] : '';
    if (!apiKey) {
      throw new AgentError('No API Key provided');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.7 } // No JSON restriction
    });

    try {
      const result = await model.generateContentStream(prompt);
      for await (const chunk of result.stream) {
        onChunk(chunk.text());
      }
    } catch (error: any) {
      console.error("Story streaming failed", error);
      throw new NetworkError('Streaming failed: ' + error.message);
    }
  }
}
