import { z } from 'zod';

export const AuthenticExperienceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['workshop', 'homestay', 'guide']),
  description: z.string(),
  estCost: z.number(),
  costJustification: z.string().optional(),
  duration: z.string()
});

export type AuthenticExperience = z.infer<typeof AuthenticExperienceSchema>;
