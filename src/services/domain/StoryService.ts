import type { IAIProvider } from '../ai/IAIProvider';
import type { UserProfile } from '../../schemas/profile';
import { MODEL_DEEP } from '../config';

export class StoryService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async generateStoryStream(placeName: string, theme: string, profile: UserProfile, onChunk: (text: string) => void): Promise<void> {
    const prompt = `Write a short, engaging storytelling narrative about ${placeName} focusing on the theme of ${theme}. Tailor the tone for a traveler interested in ${profile.interests.join(', ')}. Do not use markdown.`;
    return this.ai.generateStream(prompt, MODEL_DEEP, onChunk);
  }
}
