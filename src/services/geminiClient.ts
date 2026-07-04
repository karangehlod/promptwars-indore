import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiApiKey, defaultGenerationConfig } from './config';
import type { Result } from '../schemas/common';

let genAI: GoogleGenerativeAI | null = null;

const getClient = () => {
  if (!genAI) {
    const apiKey = getGeminiApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const safeGenerate = async <T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  modelName: string,
  retryCount = 0
): Promise<Result<T>> => {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: defaultGenerationConfig
    });

    const result = await model.generateContent(prompt);
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
  const client = getClient();
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.7 } // No JSON restriction for streaming story
  });
};
