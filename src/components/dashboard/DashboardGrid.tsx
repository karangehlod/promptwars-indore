import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRecommendations, getHiddenGems, getHeritageInsights, getLocalEvents, getAuthenticExperiences } from '../../services/agent';
import { RecommendationsPanel } from './RecommendationsPanel';
import { HiddenGemsPanel } from './HiddenGemsPanel';
import { HeritageInsights } from './HeritageInsights';
import { EventsCalendar } from './EventsCalendar';
import { ExperiencesGrid } from './ExperiencesGrid';
import { StorytellingModal } from '../story/StorytellingModal';
import { SelectionTray } from '../itinerary/SelectionTray';
import { AILoadingOverlay } from '../layout/AILoadingOverlay';

export const DashboardGrid: React.FC = () => {
  const { 
    profile, destination, 
    recommendations, setRecommendations,
    hiddenGems, setHiddenGems,
    heritage, setHeritage,
    events, setEvents,
    experiences, setExperiences,
    aiLoadingState, setAiLoadingState, setAiError
  } = useAppStore();
  
  const [activeStory, setActiveStory] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPipeline = async () => {
      if (!profile || !destination) return;
      if (recommendations.length > 0 && hiddenGems.length > 0) return; // Already loaded

      try {
        setAiLoadingState('recommendations');
        const recRes = await getRecommendations(profile, destination);
        if (!mounted) return;
        if (recRes.success) setRecommendations(recRes.data);
        else throw new Error(recRes.error.message);

        setAiLoadingState('hiddenGems');
        const hgRes = await getHiddenGems(profile, destination);
        if (!mounted) return;
        if (hgRes.success) setHiddenGems(hgRes.data);
        else throw new Error(hgRes.error.message);

        setAiLoadingState('heritage');
        const herRes = await getHeritageInsights(destination);
        if (!mounted) return;
        if (herRes.success) setHeritage(herRes.data);
        else throw new Error(herRes.error.message);

        setAiLoadingState('experiences');
        const expRes = await getAuthenticExperiences(profile, destination);
        if (!mounted) return;
        if (expRes.success) setExperiences(expRes.data);
        else throw new Error(expRes.error.message);

        setAiLoadingState('events');
        const evRes = await getLocalEvents(destination, profile.dates);
        if (!mounted) return;
        if (evRes.success) setEvents(evRes.data);
        else throw new Error(evRes.error.message);

        setAiLoadingState('done');
      } catch (err: any) {
        if (!mounted) return;
        setAiError(err.message || 'An error occurred during AI generation');
        setAiLoadingState('error');
      }
    };

    if (aiLoadingState === 'idle') {
      loadPipeline();
    }

    return () => { mounted = false; };
  }, [profile, destination, aiLoadingState]);

  if (!destination) return null;

  return (
    <div className="space-y-12 pb-32 relative">
      <AILoadingOverlay />

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Discover {destination.city}</h2>
        <p className="text-gray-500 dark:text-gray-400">We've tailored these suggestions just for you.</p>
      </div>

      <RecommendationsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
      <HiddenGemsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
      <HeritageInsights />
      <ExperiencesGrid onOpenStory={(id, name) => setActiveStory({ id, name })} />
      <EventsCalendar onOpenStory={(id, name) => setActiveStory({ id, name })} />

      {activeStory && (
        <StorytellingModal 
          placeId={activeStory.id} 
          placeName={activeStory.name} 
          onClose={() => setActiveStory(null)} 
        />
      )}
      
      {/* Sticky Selection Tray */}
      <SelectionTray />
    </div>
  );
};
