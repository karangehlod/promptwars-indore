
import type { IAIProvider } from '../ai/IAIProvider';
import type { UserProfile } from '../../schemas/profile';
import type { Destination } from '../../schemas/destination';
import { ItinerarySchema, DayPlanSchema, type Itinerary, type DayPlan } from '../../schemas/itinerary';
import type { SelectedItem } from '../../store/useAppStore';
import { MODEL_DEEP } from '../config';

export class ItineraryService {
  private ai: IAIProvider;
  constructor(ai: IAIProvider) {
    this.ai = ai;
  }

  public async generateItinerary(
    profile: UserProfile, 
    destination: Destination, 
    selections: SelectedItem[], 
    days: number, 
    budget: number
  ): Promise<Itinerary> {
    const selectionsList = selections.map(s => `${s.name} (${s.type}, est. ₹${s.estCost || 0})`).join(', ');

    const prompt = `Create a detailed ${days}-day itinerary for ${destination.city}.
User Profile: Pace is ${profile.pace}, Budget is ${budget} ${profile.budget.currency} (${profile.budget.level}).
Must include these selected activities: ${selectionsList}.
Dietary restrictions: ${profile.dietary.join(', ') || 'None'}.
Accessibility needs: ${profile.accessibility.join(', ') || 'None'}.

Rules:
1. Respect the ${profile.pace} pace (e.g., relaxed = fewer items with breaks, packed = full schedule).
2. Ensure the total cost across all items stays strictly under ${budget} INR.
3. All costs MUST be returned as numerical values representing INR.
4. Include a detailed day-by-day timing schedule.
5. Provide a budget breakdown array (categories: Food, Transport, Activities, Accommodation).
6. IMPORTANT COST GUARDRAIL: Do not hallucinate costs. For any item that has a cost, provide a short 'costJustification' (e.g., 'Standard entry ticket', 'Average lunch cost').

Return a single JSON object matching exactly this schema:
{
  "destination": { "city": "string", "region": "string", "country": "string" },
  "days": [{
    "day": number,
    "date": "string",
    "items": [{ "time": "string", "activity": "string", "notes": "string (optional)", "cost": number (optional), "costJustification": "string (optional)" }]
  }],
  "totalBudget": number,
  "budgetBreakdown": [{ "category": "string", "amount": number }]
}`;

    return this.ai.generateStructured(prompt, ItinerarySchema, MODEL_DEEP);
  }

  public async regenerateSingleDay(
    profile: UserProfile, 
    destination: Destination, 
    dayToRegenerate: DayPlan,
    allOtherDays: DayPlan[],
    budgetRemaining: number
  ): Promise<DayPlan> {
    const prompt = `Regenerate a single day itinerary (Day ${dayToRegenerate.day}, Date: ${dayToRegenerate.date}) for ${destination.city}.
User Profile: Pace is ${profile.pace}. Remaining budget for this day: ${budgetRemaining} INR.
Dietary restrictions: ${profile.dietary.join(', ') || 'None'}.

Ensure you don't repeat activities from other days:
Already scheduled: ${allOtherDays.flatMap(d => d.items.map(i => i.activity)).join(', ')}

Rules:
1. Stay under ${budgetRemaining} INR for this day.
2. Provide 'costJustification' for any cost.
3. Return a JSON object matching exactly this schema for a single DayPlan:
{
  "day": number,
  "date": "string",
  "items": [{ "time": "string", "activity": "string", "notes": "string (optional)", "cost": number (optional), "costJustification": "string (optional)" }]
}`;

    return this.ai.generateStructured(prompt, DayPlanSchema, MODEL_DEEP);
  }
}
