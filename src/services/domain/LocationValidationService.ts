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

    const prompt = `Geography fact-check. Does "${city}" exist in "${state}", "${country}"?
Accept common aliases. Different state → valid=false + correctedState. Misspelled but identifiable → valid=true + correctedCity. Fictional → valid=false. Use high confidence only when certain.
JSON only: {"valid":boolean,"confidence":"high|medium|low","correctedCity":string|undefined,"correctedState":string|undefined,"reason":string|undefined}`;

    return this.ai.generateStructured(prompt, LocationValidationSchema, MODEL_FAST);
  }
}
