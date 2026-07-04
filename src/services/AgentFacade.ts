import type { IAIProvider } from './ai/IAIProvider';
import { GeminiProvider } from './ai/GeminiProvider';
import { MockProvider } from './ai/MockProvider';

import { RecommendationService } from './domain/RecommendationService';
import { HiddenGemService } from './domain/HiddenGemService';
import { HeritageService } from './domain/HeritageService';
import { EventService } from './domain/EventService';
import { ExperienceService } from './domain/ExperienceService';
import { StoryService } from './domain/StoryService';
import { ItineraryService } from './domain/ItineraryService';
import { LocationValidationService } from './domain/LocationValidationService';

class AgentFacade {
  public recommendations: RecommendationService;
  public hiddenGems: HiddenGemService;
  public heritage: HeritageService;
  public events: EventService;
  public experiences: ExperienceService;
  public stories: StoryService;
  public itinerary: ItineraryService;
  public location: LocationValidationService;

  constructor(provider: IAIProvider) {
    this.recommendations = new RecommendationService(provider);
    this.hiddenGems = new HiddenGemService(provider);
    this.heritage = new HeritageService(provider);
    this.events = new EventService(provider);
    this.experiences = new ExperienceService(provider);
    this.stories = new StoryService(provider);
    this.itinerary = new ItineraryService(provider);
    this.location = new LocationValidationService(provider);
  }
}

const isMock = import.meta.env.VITE_USE_MOCKS === 'true';
const activeProvider = isMock ? new MockProvider() : new GeminiProvider();

export const agent = new AgentFacade(activeProvider);

