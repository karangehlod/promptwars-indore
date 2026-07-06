import { z } from 'zod';
import type { IAIProvider } from './IAIProvider';

export class MockProvider implements IAIProvider {
  private getObjectSchema(schema: any): any {
    if (schema.constructor.name === 'ZodArray' || schema instanceof z.ZodArray) {
      return schema.element || schema._def?.type;
    }
    if (schema.constructor.name === 'ZodOptional' || schema instanceof z.ZodOptional) {
      return schema.unwrap() || schema._def?.innerType;
    }
    return schema;
  }

  public async generateStructured<T>(_prompt: string, schema: z.ZodSchema<T>, _modelName: string): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const mockObj: Record<string, any> = {};
      const objSchema = this.getObjectSchema(schema);
      const shape = objSchema.shape || objSchema._def?.shape || {};
      
      for (const [key, field] of Object.entries(shape)) {
        const fieldType = (field as any).constructor.name;
        
        // 1. Array check
        if (fieldType === 'ZodArray') {
          if (key === 'items') {
            mockObj[key] = [
              { time: '09:00 AM', activity: 'Visit Historical Landmark', cost: 100, costJustification: 'Entry fee', notes: 'Enjoy the view' }
            ];
          } else if (key === 'days') {
            mockObj[key] = [
              { day: 1, date: '2026-07-10', items: [{ time: '09:00 AM', activity: 'Visit Historical Landmark', cost: 100, costJustification: 'Entry fee', notes: 'Enjoy the view' }] }
            ];
          } else if (key === 'budgetBreakdown') {
            mockObj[key] = [
              { category: 'Sightseeing', amount: 500 }
            ];
          } else {
            mockObj[key] = ['culture', 'sightseeing'];
          }
        }
        // 2. Object check
        else if (fieldType === 'ZodObject') {
          if (key === 'destination') {
            mockObj[key] = { city: 'Indore', region: 'Madhya Pradesh', country: 'India' };
          } else {
            mockObj[key] = {};
          }
        }
        // 3. Enum check
        else if (fieldType === 'ZodEnum') {
          const options = (field as any).options || (field as any)._def?.values || [];
          mockObj[key] = options[0] || 'mid';
        }
        // 4. Boolean check
        else if (fieldType === 'ZodBoolean' || key === 'valid') {
          mockObj[key] = true;
        }
        // 5. Number check
        else if (fieldType === 'ZodNumber' || key === 'day' || key === 'amount' || key === 'estCost' || key === 'cost' || key === 'totalBudget') {
          mockObj[key] = 1000;
        }
        // 6. Optional check
        else if (fieldType === 'ZodOptional') {
          if (key === 'correctedCity' || key === 'correctedState') {
            mockObj[key] = undefined;
          } else {
            const inner = (field as any)._def?.innerType;
            const innerType = inner?.constructor.name;
            if (innerType === 'ZodNumber') {
              mockObj[key] = 1000;
            } else if (innerType === 'ZodBoolean') {
              mockObj[key] = true;
            } else {
              mockObj[key] = `Mock ${key}`;
            }
          }
        }
        // 7. General strings
        else if (key.toLowerCase().includes('time')) {
          mockObj[key] = "10:00 AM";
        } else if (key.toLowerCase().includes('date')) {
          mockObj[key] = "2026-07-10";
        } else {
          mockObj[key] = `Mock data for ${key}`;
        }
      }
      
      // If the top-level schema is a ZodArray itself (like Recommendations)
      if (schema.constructor.name === 'ZodArray' || schema instanceof z.ZodArray) {
        return schema.parse([mockObj]) as T;
      }
      
      return schema.parse(mockObj) as T;
    } catch (e) {
      console.warn("MockProvider failed to parse, falling back to simple mock schema output", e);
      if (schema instanceof z.ZodArray || schema.constructor.name === 'ZodArray') {
        return schema.parse([]) as T;
      }
      return schema.parse({}) as T;
    }
  }

  public async generateStream(_prompt: string, _modelName: string, onChunk: (text: string) => void): Promise<void> {
    const text = "This is a mock streaming response. It is coming in chunks to simulate the Gemini API behavior.";
    const chunks = text.split(' ');
    
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 20));
      onChunk(chunk + ' ');
    }
  }
}
