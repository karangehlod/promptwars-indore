import { z } from 'zod';
import type { IAIProvider } from '../ai/IAIProvider';
import type { Destination } from '../../schemas/destination';
import { HeritageInsightSchema, type HeritageInsight } from '../../schemas/heritage';
import { MODEL_FAST } from '../config';

export class HeritageService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async getHeritageInsights(destination: Destination): Promise<HeritageInsight[]> {
    const prompt = `Provide 3 key heritage and historical insights about ${destination.city}, ${destination.region}, ${destination.country}.
Return a JSON array of objects:
[{ "title": "string", "period": "string", "summary": "string", "significance": "string" }]`;

    const schema = z.array(HeritageInsightSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
