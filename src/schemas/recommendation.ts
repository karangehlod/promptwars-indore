import { z } from 'zod';

export const RecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  estCost: z.number(),
  tags: z.array(z.string())
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
