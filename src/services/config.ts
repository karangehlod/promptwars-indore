export const MODEL_FAST = 'gemini-2.5-flash';
export const MODEL_DEEP = 'gemini-2.5-pro';

export const getGeminiApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn('VITE_GEMINI_API_KEY is not set in the environment variables.');
  }
  return key || '';
};

export const defaultGenerationConfig = {
  temperature: 0.7,
  responseMimeType: 'application/json'
};
