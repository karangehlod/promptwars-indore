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

export const defaultGenerationConfig = {
  temperature: 0.7,
  responseMimeType: 'application/json'
};
