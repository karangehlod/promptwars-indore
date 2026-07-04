import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Logger } from '../utils/logger';
import type { UserProfile } from '../schemas/profile';
import type { Destination } from '../schemas/destination';
import type { Recommendation } from '../schemas/recommendation';
import type { HiddenGem } from '../schemas/hiddenGem';
import type { HeritageInsight } from '../schemas/heritage';
import type { LocalEvent } from '../schemas/event';
import type { AuthenticExperience } from '../schemas/experience';
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

  activeStep: 'profile' | 'destination' | 'dashboard' | 'itinerary';
  setActiveStep: (step: 'profile' | 'destination' | 'dashboard' | 'itinerary') => void;
  hasStarted: boolean;
  setHasStarted: (hasStarted: boolean) => void;

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

  // Stories: key = "placeId::theme" → story text
  stories: Record<string, string>;
  setStory: (key: string, text: string) => void;

  // Selections for Itinerary
  selections: SelectedItem[];
  addSelection: (item: SelectedItem) => void;
  removeSelection: (id: string) => void;

  // Generated Itinerary
  itinerary: Itinerary | null;
  setItinerary: (itinerary: Itinerary | null) => void;

  // Location validation cache: key = "country|state|city"
  validatedLocations: Record<string, boolean>;
  cacheValidatedLocation: (key: string, valid: boolean) => void;

  // Retry mechanism: increment this to re-trigger the AI pipeline after an error
  retryTrigger: number;
  triggerRetry: () => void;

  // Persistence
  clearData: () => void;
}

export const useAppStore = create<AppState>()(persist((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),

  activeStep: 'profile',
  setActiveStep: (activeStep) => set({ activeStep }),
  hasStarted: false,
  setHasStarted: (hasStarted) => set({ hasStarted }),

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
  setStory: (key, text) => set((state) => ({
    stories: { ...state.stories, [key]: text }
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
  setItinerary: (itinerary) => set({ itinerary }),

  validatedLocations: {},
  cacheValidatedLocation: (key, valid) => set((state) => ({
    validatedLocations: { ...state.validatedLocations, [key]: valid }
  })),

  retryTrigger: 0,
  triggerRetry: () => set((state) => ({
    aiLoadingState: 'idle',
    aiError: null,
    retryTrigger: state.retryTrigger + 1,
  })),

  clearData: () => {
    set({
      hasStarted: false,
      activeStep: 'profile',
      profile: null,
      destination: null,
      recommendations: [],
      hiddenGems: [],
      heritage: [],
      events: [],
      experiences: [],
      stories: {},
      selections: [],
      itinerary: null,
      validatedLocations: {},
      retryTrigger: 0,
      aiLoadingState: 'idle',
      aiError: null
    });
    Logger.store('State cleared successfully');
  }
}), {
  name: 'travelyarro-storage',
  onRehydrateStorage: () => {
    Logger.init('Hydrating state from localStorage');
    return (_state: AppState | undefined, error: unknown) => {
      if (error) {
        Logger.error('Failed to hydrate state: ' + String(error));
      } else {
        Logger.store('State restored from localStorage');
      }
    };
  }
}));
