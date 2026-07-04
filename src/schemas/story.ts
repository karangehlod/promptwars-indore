import { z } from 'zod';

export const StorySchema = z.object({
  placeId: z.string(),
  title: z.string(),
  narrative: z.string(),
  theme: z.string()
});

export type Story = z.infer<typeof StorySchema>;
