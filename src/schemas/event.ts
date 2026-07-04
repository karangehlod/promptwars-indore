import { z } from 'zod';

export const LocalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  description: z.string(),
  ticketInfo: z.string().optional()
});

export type LocalEvent = z.infer<typeof LocalEventSchema>;
