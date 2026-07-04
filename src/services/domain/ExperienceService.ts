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
    const prompt = `3 authentic local experiences (workshop|homestay|guide) in ${destination.city}. Budget: ${profile.budget.level}.
Costs in INR (numbers only). Add brief costJustification.
JSON array: [{"id":"uuid","name":"string","type":"workshop|homestay|guide","description":"string","estCost":number,"costJustification":"string","duration":"string"}]`;

    const schema = z.array(AuthenticExperienceSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
