import { z } from 'zod';

export const HeritageInsightSchema = z.object({
  title: z.string(),
  period: z.string(),
  summary: z.string(),
  significance: z.string()
});

export type HeritageInsight = z.infer<typeof HeritageInsightSchema>;
