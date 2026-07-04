import { describe, it, expect } from 'vitest';
import { ProfileSchema } from '../schemas/profile';
import { ItinerarySchema } from '../schemas/itinerary';

describe('Zod Schemas', () => {
  it('validates a complete Profile', () => {
    const validProfile = {
      interests: ['History', 'Art'],
      budget: { amount: 1000, currency: 'USD', level: 'mid' },
      travelStyle: ['Comfort'],
      dates: { start: '2024-10-01', end: '2024-10-05' },
      pace: 'moderate',
      dietary: ['Vegetarian'],
      accessibility: []
    };
    
    const parsed = ProfileSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid Profile', () => {
    const invalidProfile = {
      interests: [], // Valid, but missing budget
      // budget missing
    };
    
    const parsed = ProfileSchema.safeParse(invalidProfile);
    expect(parsed.success).toBe(false);
  });

  it('validates a complete Itinerary', () => {
    const validItinerary = {
      destination: { city: 'Paris', region: 'Ile-de-France', country: 'France' },
      days: [{
        day: 1,
        date: '2024-10-01',
        items: [{ time: '10:00', activity: 'Louvre', cost: 20 }]
      }],
      totalBudget: 20,
      budgetBreakdown: [{ category: 'Activities', amount: 20 }]
    };
    
    const parsed = ItinerarySchema.safeParse(validItinerary);
    expect(parsed.success).toBe(true);
  });
});
