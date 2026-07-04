import { z } from 'zod';

export const LocationValidationSchema = z.object({
  valid: z.boolean(),
  confidence: z.enum(['high', 'medium', 'low']),
  correctedCity: z.string().optional(),
  correctedState: z.string().optional(),
  reason: z.string().optional(),
});

export type LocationValidation = z.infer<typeof LocationValidationSchema>;
