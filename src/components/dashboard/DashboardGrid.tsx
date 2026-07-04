import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { agent } from '../../services/AgentFacade';
import { RecommendationsPanel } from './RecommendationsPanel';
import { HiddenGemsPanel } from './HiddenGemsPanel';
import { HeritageInsights } from './HeritageInsights';
import { EventsCalendar } from './EventsCalendar';
import { ExperiencesGrid } from './ExperiencesGrid';
import { StorytellingModal } from '../story/StorytellingModal';
import { SelectionTray } from '../itinerary/SelectionTray';
import { AILoadingOverlay } from '../layout/AILoadingOverlay';
import { useToast } from '../../hooks/useToast';
import { TripSummarySidebar } from '../itinerary/TripSummarySidebar';

export const DashboardGrid: React.FC = () => {
  const { 
    profile, destination, 
    recommendations, setRecommendations,
    hiddenGems, setHiddenGems,
    setHeritage,
    setEvents,
    setExperiences,
    aiLoadingState, setAiLoadingState, setAiError
  } = useAppStore();
  
  const { addToast } = useToast();
  const [activeStory, setActiveStory] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPipeline = async () => {
      if (!profile || !destination) return;
      if (recommendations.length > 0 && hiddenGems.length > 0) return; // Already loaded

      try {
        // ROW 1: Recommendations
        setAiLoadingState('recommendations');
        const recRes = await agent.recommendations.getRecommendations(profile, destination);
        if (!mounted) return;
        setRecommendations(recRes);

        // ROW 2: Hidden Gems & Heritage (Parallel)
        setAiLoadingState('hiddenGems');
        const [hgRes, herRes] = await Promise.allSettled([
          agent.hiddenGems.getHiddenGems(profile, destination),
          agent.heritage.getHeritageInsights(destination)
        ]);
        if (!mounted) return;
        if (hgRes.status === 'fulfilled') setHiddenGems(hgRes.value);
        if (herRes.status === 'fulfilled') setHeritage(herRes.value);

        // ROW 3: Experiences & Events (Parallel)
        setAiLoadingState('experiences');
        const [expRes, evRes] = await Promise.allSettled([
          agent.experiences.getAuthenticExperiences(profile, destination),
          agent.events.getLocalEvents(destination, profile.dates)
        ]);
        if (!mounted) return;
        if (expRes.status === 'fulfilled') setExperiences(expRes.value);
        if (evRes.status === 'fulfilled') setEvents(evRes.value);

        setAiLoadingState('done');
        addToast('Dashboard fully loaded!', 'success');
      } catch (err: any) {
        if (!mounted) return;
        setAiError(err.message || 'An error occurred during AI generation');
        setAiLoadingState('error');
        addToast(err.message, 'error');
      }
    };

    if (aiLoadingState === 'idle') {
      loadPipeline();
    }

    return () => { mounted = false; };
  }, [
    profile, 
    destination, 
    aiLoadingState, 
    addToast, 
    recommendations.length, 
    hiddenGems.length, 
    setAiLoadingState, 
    setRecommendations, 
    setHiddenGems, 
    setHeritage, 
    setExperiences, 
    setEvents, 
    setAiError
  ]);

  if (!destination) return null;

  return (
    <div className="flex gap-6 pb-32 relative">
      <AILoadingOverlay />

      <div className="flex-1 space-y-12 max-w-5xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Discover {destination.city}</h2>
          <p className="text-text-secondary">We've tailored these suggestions just for you.</p>
        </div>

        <RecommendationsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <HiddenGemsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <HeritageInsights />
        <ExperiencesGrid onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <EventsCalendar onOpenStory={(id, name) => setActiveStory({ id, name })} />
      </div>

      {/* Desktop Trip Summary Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-8">
          <TripSummarySidebar />
        </div>
      </div>

      {activeStory && (
        <StorytellingModal 
          placeId={activeStory.id} 
          placeName={activeStory.name} 
          onClose={() => setActiveStory(null)} 
        />
      )}
      
      {/* Mobile Sticky Selection Tray (Fallback if needed) */}
      <div className="lg:hidden">
        <SelectionTray />
      </div>
    </div>
  );
};
