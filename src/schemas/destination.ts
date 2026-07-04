import { z } from 'zod';

export const DestinationSchema = z.object({
  city: z.string(),
  region: z.string(),
  country: z.string()
});

export type Destination = z.infer<typeof DestinationSchema>;
