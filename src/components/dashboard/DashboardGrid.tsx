import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RecommendationsPanel } from './RecommendationsPanel';
import { HiddenGemsPanel } from './HiddenGemsPanel';
import { HeritageInsights } from './HeritageInsights';
import { EventsCalendar } from './EventsCalendar';
import { ExperiencesGrid } from './ExperiencesGrid';
import { StorytellingModal } from '../story/StorytellingModal';
import { SelectionTray } from '../itinerary/SelectionTray';

export const DashboardGrid: React.FC = () => {
  const { destination } = useAppStore();
  const [activeStory, setActiveStory] = useState<{ id: string, name: string } | null>(null);

  if (!destination) return null;

  return (
    <div className="space-y-12 pb-32 relative">
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
