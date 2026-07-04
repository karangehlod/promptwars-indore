import type { IAIProvider } from '../ai/IAIProvider';
import type { UserProfile } from '../../schemas/profile';
import { MODEL_FAST } from '../config';
import { Logger } from '../../utils/logger';

const THEME_FOCUS: Record<string, string> = {
  'Folklore & Legends': 'local myths, folk tales, and legendary stories',
  'History & Secrets': 'hidden historical facts, little-known events, and intriguing secrets',
  'Adventure & Thrills': 'adventurous activities, thrilling experiences, and outdoor exploration',
  'Culinary Journey': 'signature dishes, food culture, street food, and culinary traditions',
};

export class StoryService {
  private ai: IAIProvider;

  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async generateStoryStream(
    placeName: string,
    theme: string,
    profile: UserProfile,
    onChunk: (text: string) => void,
  ): Promise<void> {
    const focus = THEME_FOCUS[theme] || theme;
    const interests = profile.interests.slice(0, 3).join(', ');

    // Short, punchy prompt — Flash handles this well at 1028 tokens
    const prompt = `Storytelling travel guide. Write a vivid 200–250 word story about ${placeName}, India, focusing on ${focus}. Audience interests: ${interests}. Use second person. Plain text only, no markdown. Start directly.`;

    Logger.ai(`Generating story for "${placeName}" — theme: ${theme}`);
    return this.ai.generateStream(prompt, MODEL_FAST, onChunk);
  }
}
