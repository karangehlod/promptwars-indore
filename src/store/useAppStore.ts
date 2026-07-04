import { create } from 'zustand';
import type { UserProfile } from '../schemas/profile';
import type { Destination } from '../schemas/destination';
import type { Recommendation } from '../schemas/recommendation';
import type { HiddenGem } from '../schemas/hiddenGem';
import type { HeritageInsight } from '../schemas/heritage';
import type { LocalEvent } from '../schemas/event';
import type { AuthenticExperience } from '../schemas/experience';
import type { Story } from '../schemas/story';
import type { Itinerary } from '../schemas/itinerary';

export type SelectedItem = {
  id: string;
  type: 'recommendation' | 'hiddenGem' | 'event' | 'experience';
  name: string;
  estCost?: number;
};

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // UI State
  activeStep: 'profile' | 'destination' | 'dashboard' | 'itinerary';
  setActiveStep: (step: 'profile' | 'destination' | 'dashboard' | 'itinerary') => void;

  // AI Pipeline State
  aiLoadingState: 'idle' | 'recommendations' | 'hiddenGems' | 'heritage' | 'experiences' | 'events' | 'error' | 'done';
  setAiLoadingState: (state: 'idle' | 'recommendations' | 'hiddenGems' | 'heritage' | 'experiences' | 'events' | 'error' | 'done') => void;
  aiError: string | null;
  setAiError: (error: string | null) => void;

  // Data
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  destination: Destination | null;
  setDestination: (destination: Destination) => void;

  // Dashboard Data
  recommendations: Recommendation[];
  setRecommendations: (recommendations: Recommendation[]) => void;

  hiddenGems: HiddenGem[];
  setHiddenGems: (gems: HiddenGem[]) => void;

  heritage: HeritageInsight[];
  setHeritage: (heritage: HeritageInsight[]) => void;

  events: LocalEvent[];
  setEvents: (events: LocalEvent[]) => void;

  experiences: AuthenticExperience[];
  setExperiences: (experiences: AuthenticExperience[]) => void;

  // Stories map placeId -> Story
  stories: Record<string, Story>;
  setStory: (placeId: string, story: Story) => void;

  // Selections for Itinerary
  selections: SelectedItem[];
  addSelection: (item: SelectedItem) => void;
  removeSelection: (id: string) => void;

  // Generated Itinerary
  itinerary: Itinerary | null;
  setItinerary: (itinerary: Itinerary | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),

  activeStep: 'profile',
  setActiveStep: (activeStep) => set({ activeStep }),

  aiLoadingState: 'idle',
  setAiLoadingState: (aiLoadingState) => set({ aiLoadingState }),
  aiError: null,
  setAiError: (aiError) => set({ aiError }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  destination: null,
  setDestination: (destination) => set({ destination }),

  recommendations: [],
  setRecommendations: (recommendations) => set({ recommendations }),

  hiddenGems: [],
  setHiddenGems: (hiddenGems) => set({ hiddenGems }),

  heritage: [],
  setHeritage: (heritage) => set({ heritage }),

  events: [],
  setEvents: (events) => set({ events }),

  experiences: [],
  setExperiences: (experiences) => set({ experiences }),

  stories: {},
  setStory: (placeId, story) => set((state) => ({ 
    stories: { ...state.stories, [placeId]: story } 
  })),

  selections: [],
  addSelection: (item) => set((state) => ({
    selections: state.selections.some(s => s.id === item.id) 
      ? state.selections 
      : [...state.selections, item]
  })),
  removeSelection: (id) => set((state) => ({
    selections: state.selections.filter(s => s.id !== id)
  })),

  itinerary: null,
  setItinerary: (itinerary) => set({ itinerary })
}));
