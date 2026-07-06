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

    // Rich, structured prompt — uses the full 2048 token budget
    const prompt = `You are an immersive travel storyteller for India. Write a rich, engaging 450–600 word travel narrative about "${placeName}", India.

THEME: Focus exclusively on ${focus}.
AUDIENCE: A traveller who enjoys ${interests}.
VOICE: Second person ("you"), vivid and evocative. No marketing fluff.
FORMAT: Plain text only — absolutely NO markdown, no bullet points, no headers, no asterisks, no hashtags.

Structure your response naturally in these four parts (but do NOT label them):
1. OPENING HOOK (2-3 sentences): A sensory or dramatic scene that drops the reader right into the place.
2. MAIN NARRATIVE (250–350 words): The heart of the story — history, experience, people, flavours, or adventure depending on the theme. Include at least one specific local detail, name, or anecdote that brings it to life.
3. ATMOSPHERE (50–80 words): What the place feels, sounds, and smells like at its most authentic moment.
4. VISITOR TIP (30–50 words): One specific, practical, insider tip for visiting — best time, hidden spot, local phrase, or unmissable detail.

Start directly with the opening hook. Do not introduce yourself or say "here is the story".`;

    Logger.ai(`Generating story for "${placeName}" — theme: ${theme}`);
    return this.ai.generateStream(prompt, MODEL_FAST, onChunk);
  }
}
