import { z } from 'zod';
import type { IAIProvider } from './IAIProvider';

export class MockProvider implements IAIProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async generateStructured<T>(_prompt: string, schema: z.ZodSchema<T>, _modelName: string): Promise<T> {
    // Basic mock data extraction - in reality this would be more sophisticated 
    // or return predefined fixture data. For this example we just try to parse empty object
    // or return a dummy based on some basic heuristics.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try to return a valid dummy object that passes schema
    try {
      // Extremely naive mock data generator
      // In a real app we'd use something like JSON schema faker or specific fixtures
      const shape = (schema as any)._def?.shape();
      if (!shape) throw new Error("Could not determine schema shape");
      
      const mockObj: any = {};
      for (const [key, value] of Object.entries(shape)) {
        if (key.toLowerCase().includes('cost')) mockObj[key] = 50;
        else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) mockObj[key] = `Mock ${key}`;
        else if (key.toLowerCase().includes('time')) mockObj[key] = "10:00 AM";
        else if ((value as any)._def?.typeName === 'ZodArray') mockObj[key] = [];
        else mockObj[key] = `Mock data for ${key}`;
      }
      
      return schema.parse(mockObj);
    } catch (e) {
      console.warn("MockProvider failed to generate schema-valid dummy data", e);
      throw new Error("Mock provider failed");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async generateStream(_prompt: string, _modelName: string, onChunk: (text: string) => void): Promise<void> {
    const text = "This is a mock streaming response. It is coming in chunks to simulate the Gemini API behavior.";
    const chunks = text.split(' ');
    
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onChunk(chunk + ' ');
    }
  }
}
