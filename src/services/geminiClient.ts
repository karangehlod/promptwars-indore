import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiApiKeys, defaultGenerationConfig } from './config';
import type { Result } from '../schemas/common';
import { globalApiQueue } from './apiQueue';

export const safeGenerate = async <T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  modelName: string,
  retryCount = 0
): Promise<Result<T>> => {
  try {
    // Submit to queue to handle rate limits, sequential execution, and deduplication
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
      const json = JSON.parse(text);
      const parsed = schema.safeParse(json);
      
      if (parsed.success) {
        return { success: true, data: parsed.data };
      } else {
        if (retryCount < 1) {
          console.warn('Schema validation failed, retrying...', parsed.error);
          return safeGenerate(
            prompt + "\n\nCRITICAL: You must return STRICT JSON ONLY that matches the requested schema. No markdown formatting.",
            schema,
            modelName,
            retryCount + 1
          );
        }
        return { 
          success: false, 
          error: { message: 'Failed to parse structured response from AI.', code: 'SCHEMA_ERROR' } 
        };
      }
    } catch (e) {
       if (retryCount < 1) {
          console.warn('JSON parsing failed, retrying...', e);
          return safeGenerate(
            prompt + "\n\nCRITICAL: You must return STRICT JSON ONLY. Do not wrap in ```json blocks.",
            schema,
            modelName,
            retryCount + 1
          );
        }
        return { 
          success: false, 
          error: { message: 'Invalid JSON response from AI.', code: 'JSON_ERROR' } 
        };
    }

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: { message: error.message || 'An unknown error occurred during AI generation.', code: 'API_ERROR' }
    };
  }
};

export const getStreamingModel = (modelName: string) => {
  const keys = getGeminiApiKeys();
  const apiKey = keys.length > 0 ? keys[0] : '';
  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.7 } // No JSON restriction for streaming story
  });
};
