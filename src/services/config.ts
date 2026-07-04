export const MODEL_FAST = 'gemini-2.5-flash';
export const MODEL_DEEP = 'gemini-2.5-pro';

export const getGeminiApiKeys = (): string[] => {
  const keyString = import.meta.env.VITE_GEMINI_API_KEY;
  if (!keyString) {
    console.warn('VITE_GEMINI_API_KEY is not set in the environment variables.');
    return [];
  }
  return keyString.split(',').map((k: string) => k.trim()).filter(Boolean);
};

// Default config for dashboard calls (3–5 item arrays with descriptions)
// 2048 ensures no JSON truncation; thinkingBudget=0 disables thinking tokens on Flash for speed
export const defaultGenerationConfig = {
  temperature: 0.7,
  responseMimeType: 'application/json',
  maxOutputTokens: 8193,
  thinkingConfig: { thinkingBudget: 0 },
};

// Deeper config for itinerary and multi-day plans that need more detail
export const deepGenerationConfig = {
  temperature: 0.6,
  responseMimeType: 'application/json',
  maxOutputTokens: 16200,
};
