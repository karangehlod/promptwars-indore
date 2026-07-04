import { z } from 'zod';

export const BudgetSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  level: z.enum(['budget', 'mid', 'luxury'])
});

export const ProfileSchema = z.object({
  interests: z.array(z.string()),
  budget: BudgetSchema,
  travelStyle: z.array(z.string()),
  dates: z.object({
    start: z.string(),
    end: z.string()
  }),
  pace: z.enum(['relaxed', 'moderate', 'packed']),
  dietary: z.array(z.string()),
  accessibility: z.array(z.string())
});

export type Budget = z.infer<typeof BudgetSchema>;
export type UserProfile = z.infer<typeof ProfileSchema>;
