import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIProvider } from './IAIProvider';
import { globalApiQueue } from '../apiQueue';
import { defaultGenerationConfig, getGeminiApiKeys } from '../config';
import { AgentError, RateLimitError, ValidationError, NetworkError } from './AgentError';

export class GeminiProvider implements IAIProvider {
  public async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>, modelName: string, retryCount = 0): Promise<T> {
    try {
      const result = await globalApiQueue.enqueue(prompt, modelName, async (apiKey) => {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: defaultGenerationConfig
        });
        return model.generateContent(prompt);
      });

      const text = result.response.text();
      
      try {
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const validated = schema.parse(parsed);
        return validated;
      } catch (e: any) {
        if (retryCount < 1) {
          console.warn('JSON parsing or validation failed, retrying once...', e);
          const fixPrompt = `${prompt}\n\nIMPORTANT: The previous response was invalid. Ensure it is strict JSON matching the exact schema. Error: ${e.message}`;
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
        throw new RateLimitError(error.message || 'API Quota Exceeded');
      }
      
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
