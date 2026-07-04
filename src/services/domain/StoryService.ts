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

    // Short, punchy prompt — Flash handles this well at ~800 tokens
    const prompt = `You are a storytelling travel guide. Write a vivid, engaging story (200–250 words) about ${placeName}, India, focusing on ${focus}.
Tailor the tone for a traveler interested in: ${interests}.
Write in second person ("you") to make it immersive.
Do NOT use markdown, headers, or bullet points — plain text paragraphs only.
Start directly with the story, no preamble.`;

    Logger.ai(`Generating story for "${placeName}" — theme: ${theme}`);
    return this.ai.generateStream(prompt, MODEL_FAST, onChunk);
  }
}
