import { z } from 'zod';
import { safeGenerate, getStreamingModel } from './geminiClient';
import { MODEL_FAST, MODEL_DEEP } from './config';
import type { UserProfile } from '../schemas/profile';
import type { Destination } from '../schemas/destination';
import { RecommendationSchema } from '../schemas/recommendation';
import type { Recommendation } from '../schemas/recommendation';
import { HiddenGemSchema } from '../schemas/hiddenGem';
import type { HiddenGem } from '../schemas/hiddenGem';
import { HeritageInsightSchema } from '../schemas/heritage';
import type { HeritageInsight } from '../schemas/heritage';
import { LocalEventSchema } from '../schemas/event';
import type { LocalEvent } from '../schemas/event';
import { AuthenticExperienceSchema } from '../schemas/experience';
import type { AuthenticExperience } from '../schemas/experience';
import { ItinerarySchema } from '../schemas/itinerary';
import type { Itinerary } from '../schemas/itinerary';
import type { SelectedItem } from '../store/useAppStore';
import type { Result } from '../schemas/common';

const isMock = import.meta.env.VITE_USE_MOCKS === 'true';

// 1. Recommendations
export const getRecommendations = async (profile: UserProfile, destination: Destination): Promise<Result<Recommendation[]>> => {
  if (isMock) return { success: true, data: [{ id: '1', name: 'Eiffel Tower', category: 'Landmark', description: 'Iconic tower', estCost: 30, tags: ['history', 'view'] }] };
  
  const prompt = `Generate 5 personalized travel recommendations for ${destination.city}, ${destination.region}, ${destination.country} based on these interests: ${profile.interests.join(', ')} and a ${profile.budget.level} budget. All estimated costs MUST be strictly in INR (₹) without currency symbols.
  Return a JSON array of objects matching this schema exactly:
  [{ "id": "uuid", "name": "string", "category": "string", "description": "string", "estCost": number, "tags": ["string"] }]`;

  const schema = z.array(RecommendationSchema);
  return safeGenerate(prompt, schema, MODEL_FAST);
};

// 2. Hidden Gems
export const getHiddenGems = async (profile: UserProfile, destination: Destination): Promise<Result<HiddenGem[]>> => {
  if (isMock) return { success: true, data: [{ id: '1', name: 'Secret Garden', description: 'Quiet spot', whyHidden: 'No signs', location: 'Alley 4' }] };

  const prompt = `Discover 3 hidden gems in ${destination.city}, ${destination.country} avoiding tourist traps, tailored for someone who likes ${profile.interests.join(', ')}.
  Return a JSON array of objects:
  [{ "id": "uuid", "name": "string", "description": "string", "whyHidden": "string", "location": "string" }]`;

  const schema = z.array(HiddenGemSchema);
  return safeGenerate(prompt, schema, MODEL_FAST);
};

// 3. Heritage Insights
export const getHeritageInsights = async (destination: Destination): Promise<Result<HeritageInsight[]>> => {
  if (isMock) return { success: true, data: [{ title: 'Roman Ruins', period: '100 AD', summary: 'Ancient walls', significance: 'Historical' }] };

  const prompt = `Provide 3 key heritage and historical insights about ${destination.city}, ${destination.region}, ${destination.country}.
  Return a JSON array of objects:
  [{ "title": "string", "period": "string", "summary": "string", "significance": "string" }]`;

  const schema = z.array(HeritageInsightSchema);
  return safeGenerate(prompt, schema, MODEL_FAST);
};

// 4. Local Events
export const getLocalEvents = async (destination: Destination, dates: {start: string, end: string}): Promise<Result<LocalEvent[]>> => {
  if (isMock) return { success: true, data: [{ id: '1', name: 'Summer Festival', date: dates.start, description: 'Music and food', ticketInfo: 'Free' }] };

  const prompt = `Suggest 3 local events or seasonal festivals happening in ${destination.city} around ${dates.start} to ${dates.end}.
  Return a JSON array of objects:
  [{ "id": "uuid", "name": "string", "date": "string", "description": "string", "ticketInfo": "string (optional)" }]`;

  const schema = z.array(LocalEventSchema);
  return safeGenerate(prompt, schema, MODEL_FAST);
};

// 5. Authentic Experiences
export const getAuthenticExperiences = async (profile: UserProfile, destination: Destination): Promise<Result<AuthenticExperience[]>> => {
  if (isMock) return { success: true, data: [{ id: '1', name: 'Cooking Class', type: 'workshop', description: 'Learn to cook pasta', estCost: 50, duration: '3 hours' }] };

  const prompt = `Suggest 3 authentic local experiences (workshop, homestay, or guide) in ${destination.city} for a ${profile.budget.level} budget traveler. All estimated costs MUST be strictly in INR (₹) without currency symbols.
  Return a JSON array of objects:
  [{ "id": "uuid", "name": "string", "type": "workshop|homestay|guide", "description": "string", "estCost": number, "duration": "string" }]`;

  const schema = z.array(AuthenticExperienceSchema);
  return safeGenerate(prompt, schema, MODEL_FAST);
};

// 6. Generate Story (Streaming)
export const generateStoryStream = async (placeName: string, theme: string, profile: UserProfile, onChunk: (text: string) => void): Promise<void> => {
  if (isMock) {
    onChunk("Once upon a time in " + placeName + "...");
    return;
  }
  
  const prompt = `Write a short, engaging storytelling narrative about ${placeName} focusing on the theme of ${theme}. Tailor the tone for a traveler interested in ${profile.interests.join(', ')}. Do not use markdown.`;
  const model = getStreamingModel(MODEL_DEEP);
  
  try {
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      onChunk(chunk.text());
    }
  } catch (error) {
    console.error("Story streaming failed", error);
    onChunk("\n[Error generating story. Please try again.]");
  }
};

// 7. Generate Itinerary
export const generateItinerary = async (profile: UserProfile, destination: Destination, selections: SelectedItem[], days: number, budget: number): Promise<Result<Itinerary>> => {
  if (isMock) {
    return {
      success: true,
      data: {
        destination,
        days: [{ day: 1, date: profile.dates.start, items: [{ time: '09:00', activity: 'Breakfast', cost: 15 }] }],
        totalBudget: 15,
        budgetBreakdown: [{ category: 'Food', amount: 15 }]
      }
    };
  }

  const selectionsList = selections.map(s => `${s.name} (${s.type}, est. $${s.estCost || 0})`).join(', ');

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

  Return a single JSON object matching exactly this schema:
  {
    "destination": { "city": "string", "region": "string", "country": "string" },
    "days": [{
      "day": number,
      "date": "string",
      "items": [{ "time": "string", "activity": "string", "notes": "string (optional)", "cost": number (optional) }]
    }],
    "totalBudget": number,
    "budgetBreakdown": [{ "category": "string", "amount": number }]
  }`;

  return safeGenerate(prompt, ItinerarySchema, MODEL_DEEP);
};
