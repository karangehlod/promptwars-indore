import { z } from 'zod';
import type { UserProfile } from '../../schemas/profile';
import type { Destination } from '../../schemas/destination';
import { HiddenGemSchema, type HiddenGem } from '../../schemas/hiddenGem';
import type { IAIProvider } from '../ai/IAIProvider';
import { MODEL_FAST } from '../config';

export class HiddenGemService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async getHiddenGems(profile: UserProfile, destination: Destination): Promise<HiddenGem[]> {
    const prompt = `3 hidden gems in ${destination.city}, ${destination.country} (avoid tourist traps). Interests: ${profile.interests.join(', ')}.
JSON array: [{"id":"uuid","name":"string","description":"string","whyHidden":"string","location":"string"}]`;

    const schema = z.array(HiddenGemSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
