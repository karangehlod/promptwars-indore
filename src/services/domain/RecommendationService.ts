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
    const prompt = `Generate 5 personalized travel recommendations for ${destination.city}, ${destination.region}, ${destination.country} based on these interests: ${profile.interests.join(', ')} and a ${profile.budget.level} budget. 
All estimated costs MUST be strictly in INR (₹) without currency symbols. 
IMPORTANT COST GUARDRAIL: Do not hallucinate costs. Provide an exact estimated cost in INR, and provide a short 'costJustification' explaining why it costs that much (e.g., 'Standard entry fee + guide' or 'Typical average meal cost in this region').

Return a JSON array of objects matching this schema exactly:
[{ "id": "uuid", "name": "string", "category": "string", "description": "string", "estCost": number, "costJustification": "string", "tags": ["string"] }]`;

    const schema = z.array(RecommendationSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
