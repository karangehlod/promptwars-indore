import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeGenerate } from '../services/geminiClient';
import { RecommendationSchema } from '../schemas/recommendation';
import * as config from '../services/config';

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: async () => ({
            response: {
              text: () => JSON.stringify([{ id: '1', name: 'Test', category: 'Cat', description: 'Desc', estCost: 10, tags: ['tag'] }])
            }
          })
        };
      }
    }
  };
});

describe('Gemini Client safeGenerate', () => {
  beforeEach(() => {
    vi.spyOn(config, 'getGeminiApiKey').mockReturnValue('fake-key');
  });

  it('successfully parses valid JSON matching schema', async () => {
    const result = await safeGenerate('Test prompt', RecommendationSchema.array(), 'fake-model');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test');
    }
  });
});
