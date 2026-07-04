import { z } from 'zod';
import type { Destination } from '../../schemas/destination';
import { LocalEventSchema, type LocalEvent } from '../../schemas/event';
import { MODEL_FAST } from '../config';
import type { IAIProvider } from '../ai/IAIProvider';

export class EventService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async getLocalEvents(destination: Destination, dates: {start: string, end: string}): Promise<LocalEvent[]> {
    const prompt = `Suggest 3 local events or seasonal festivals happening in ${destination.city} around ${dates.start} to ${dates.end}.
Return a JSON array of objects:
[{ "id": "uuid", "name": "string", "date": "string", "description": "string", "ticketInfo": "string (optional)" }]`;

    const schema = z.array(LocalEventSchema);
    return this.ai.generateStructured(prompt, schema, MODEL_FAST);
  }
}
