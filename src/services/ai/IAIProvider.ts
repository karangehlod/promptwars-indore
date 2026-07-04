import { z } from 'zod';

export interface IAIProvider {
  /**
   * Generates structured content enforcing the provided Zod schema.
   */
  generateStructured<T>(prompt: string, schema: z.ZodSchema<T>, modelName: string): Promise<T>;

  /**
   * Generates a stream of text and invokes the callback on each chunk.
   */
  generateStream(prompt: string, modelName: string, onChunk: (text: string) => void): Promise<void>;
}
