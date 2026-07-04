import { z } from 'zod';

export const HiddenGemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  whyHidden: z.string(),
  location: z.string()
});

export type HiddenGem = z.infer<typeof HiddenGemSchema>;
