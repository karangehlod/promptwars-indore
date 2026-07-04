
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

    const prompt = `${days}-day itinerary for ${destination.city}. Pace: ${profile.pace}. Budget: ${budget} INR (${profile.budget.level}).
Include: ${selectionsList}.
Diet: ${profile.dietary.join(', ') || 'None'}. Accessibility: ${profile.accessibility.join(', ') || 'None'}.
Rules: total under ${budget} INR; costs as numbers; add brief costJustification per cost.
JSON: {"destination":{"city":"string","region":"string","country":"string"},"days":[{"day":number,"date":"string","items":[{"time":"string","activity":"string","notes":"string (optional)","cost":number (optional),"costJustification":"string (optional)"}]}],"totalBudget":number,"budgetBreakdown":[{"category":"string","amount":"number"}]}`;

    return this.ai.generateStructured(prompt, ItinerarySchema, MODEL_DEEP);
  }

  public async regenerateSingleDay(
    profile: UserProfile, 
    destination: Destination, 
    dayToRegenerate: DayPlan,
    allOtherDays: DayPlan[],
    budgetRemaining: number
  ): Promise<DayPlan> {
    const prompt = `Regenerate Day ${dayToRegenerate.day} (${dayToRegenerate.date}) for ${destination.city}. Pace: ${profile.pace}. Budget left: ${budgetRemaining} INR. Diet: ${profile.dietary.join(', ') || 'None'}.
Avoid repeating: ${allOtherDays.flatMap(d => d.items.map(i => i.activity)).join(', ') || 'none'}.
Stay under ${budgetRemaining} INR; add brief costJustification per cost.
JSON: {"day":number,"date":"string","items":[{"time":"string","activity":"string","notes":"string (optional)","cost":number (optional)","costJustification":"string (optional)"}]}`;

    return this.ai.generateStructured(prompt, DayPlanSchema, MODEL_DEEP);
  }
}
