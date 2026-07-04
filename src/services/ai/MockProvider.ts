import { z } from 'zod';
import type { IAIProvider } from './IAIProvider';

export class MockProvider implements IAIProvider {
  public async generateStructured<T>(_prompt: string, schema: z.ZodSchema<T>, _modelName: string): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try to return a valid dummy object that passes schema
    try {
      // Extremely naive mock data generator
      // In a real app we'd use something like JSON schema faker or specific fixtures
      const shape = (schema as z.ZodObject<z.ZodRawShape>)._def?.shape?.();
      if (!shape) throw new Error("Could not determine schema shape");
      
      const mockObj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(shape)) {
        if (key.toLowerCase().includes('cost')) mockObj[key] = 50;
        else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) mockObj[key] = `Mock ${key}`;
        else if (key.toLowerCase().includes('time')) mockObj[key] = "10:00 AM";
        else if ((value as z.ZodTypeAny)._def?.typeName === 'ZodArray') mockObj[key] = [];
        else mockObj[key] = `Mock data for ${key}`;
      }
      
      return schema.parse(mockObj);
    } catch (e) {
      console.warn("MockProvider failed to generate schema-valid dummy data", e);
      throw new Error("Mock provider failed");
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
