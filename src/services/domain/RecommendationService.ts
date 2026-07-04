import { z } from 'zod';
import type { UserProfile } from '../../schemas/profile';
import type { Destination } from '../../schemas/destination';
import { RecommendationSchema, type Recommendation } from '../../schemas/recommendation';
import { MODEL_FAST } from '../config';
import type { IAIProvider } from '../ai/IAIProvider';

export class RecommendationService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async getRecommendations(profile: UserProfile, destination: Destination): Promise<Recommendation[]> {
    const prompt = `5 travel recommendations for ${destination.city}, ${destination.country}. Interests: ${profile.interests.join(', ')}. Budget: ${profile.budget.level}.
Costs in INR (numbers only, no symbol). Add brief costJustification (e.g., "Standard entry fee").
JSON array: [{"id":"uuid","name":"string","category":"string","description":"string","estCost":number,"costJustification":"string","tags":["string"]}]`;

    const schema = z.array(RecommendationSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
