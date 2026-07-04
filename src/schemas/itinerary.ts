import { z } from 'zod';
import { DestinationSchema } from './destination';

export const DayPlanItemSchema = z.object({
  time: z.string(),
  activity: z.string(),
  notes: z.string().optional(),
  cost: z.number().optional()
});

export const DayPlanSchema = z.object({
  day: z.number(),
  date: z.string(),
  items: z.array(DayPlanItemSchema)
});

export const ItinerarySchema = z.object({
  destination: DestinationSchema,
  days: z.array(DayPlanSchema),
  totalBudget: z.number(),
  budgetBreakdown: z.array(
    z.object({
      category: z.string(),
      amount: z.number()
    })
  )
});

export type DayPlanItem = z.infer<typeof DayPlanItemSchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
