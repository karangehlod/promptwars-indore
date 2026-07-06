import { z } from 'zod';
import type { IAIProvider } from './IAIProvider';

export class MockProvider implements IAIProvider {
  public async generateStructured<T>(_prompt: string, schema: z.ZodSchema<T>, _modelName: string): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock data matcher based on basic schema parsing
    try {
      const mockObj: Record<string, any> = {};
      const shape = (schema as any).shape || (schema as any)._def?.shape || {};
      
      for (const key of Object.keys(shape)) {
        if (key.toLowerCase().includes('cost')) {
          mockObj[key] = 500;
        } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
          mockObj[key] = `Mock ${key}`;
        } else if (key.toLowerCase().includes('time')) {
          mockObj[key] = "10:00 AM";
        } else if (key.toLowerCase().includes('date')) {
          mockObj[key] = "2026-07-06";
        } else if (key.toLowerCase().includes('items')) {
          mockObj[key] = [];
        } else {
          mockObj[key] = `Mock data for ${key}`;
        }
      }
      
      // Try parsing mockObj. If it's a ZodArray schema, return a mock array instead
      if (schema instanceof z.ZodArray) {
        return schema.parse([mockObj]) as T;
      }
      
      return schema.parse(mockObj) as T;
    } catch (e) {
      console.warn("MockProvider failed to parse, fallback to empty array or object", e);
      return schema.parse(schema instanceof z.ZodArray ? [] : {}) as T;
    }
  }

  public async generateStream(_prompt: string, _modelName: string, onChunk: (text: string) => void): Promise<void> {
    const text = "This is a mock streaming response. It is coming in chunks to simulate the Gemini API behavior.";
    const chunks = text.split(' ');
    
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onChunk(chunk + ' ');
    }
  }
}
