import { z } from 'zod';
import type { UserProfile } from '../../schemas/profile';
import type { Destination } from '../../schemas/destination';
import { AuthenticExperienceSchema, type AuthenticExperience } from '../../schemas/experience';
import { MODEL_FAST } from '../config';
import type { IAIProvider } from '../ai/IAIProvider';

export class ExperienceService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async getAuthenticExperiences(profile: UserProfile, destination: Destination): Promise<AuthenticExperience[]> {
    const prompt = `Suggest 3 authentic local experiences (workshop, homestay, or guide) in ${destination.city} for a ${profile.budget.level} budget traveler. 
All estimated costs MUST be strictly in INR (₹) without currency symbols.
IMPORTANT COST GUARDRAIL: Do not hallucinate costs. Provide an exact estimated cost in INR, and provide a short 'costJustification' explaining why it costs that much (e.g., 'Typical daily rate for a local guide' or 'Average cost for a 3-hour workshop').

Return a JSON array of objects:
[{ "id": "uuid", "name": "string", "type": "workshop|homestay|guide", "description": "string", "estCost": number, "costJustification": "string", "duration": "string" }]`;

    const schema = z.array(AuthenticExperienceSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
