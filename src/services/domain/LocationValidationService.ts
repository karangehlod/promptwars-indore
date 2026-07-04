import type { IAIProvider } from '../ai/IAIProvider';
import { LocationValidationSchema, type LocationValidation } from '../../schemas/location';
import { MODEL_FAST } from '../config';
import { Logger } from '../../utils/logger';

export class LocationValidationService {
  private ai: IAIProvider;

  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async validate(country: string, state: string, city: string): Promise<LocationValidation> {
    Logger.ai(`Validating location: ${city}, ${state}, ${country}`);

    const prompt = `You are a geography fact-checker. Determine whether the following city actually exists within the given state and country in real life.

City: "${city}"
State/Union Territory: "${state}"
Country: "${country}"

Rules:
- Be precise about Indian geography. Many cities are colloquially called by different names — accept common known aliases.
- If the city is real but belongs to a DIFFERENT state, set valid=false and provide correctedState.
- If the city name is misspelled but clearly identifiable, set valid=true with correctedCity.
- If the city is fictional or genuinely does not exist, set valid=false.
- Only respond with high confidence if you are certain. Use medium or low when unsure.

Respond ONLY with a JSON object matching this exact schema — no extra text:
{ "valid": boolean, "confidence": "high"|"medium"|"low", "correctedCity": string|undefined, "correctedState": string|undefined, "reason": string|undefined }`;

    return this.ai.generateStructured(prompt, LocationValidationSchema, MODEL_FAST);
  }
}
