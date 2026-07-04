import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';

export const EventsCalendar: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { events, aiLoadingState, aiError } = useAppStore();

  if (events.length === 0) {
    if (aiError && aiLoadingState === 'error') {
      return null;
    }
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center">Local Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Local Events & Festivals</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <PlaceCard 
            key={event.id}
            id={event.id}
            type="event"
            name={event.name}
            description={event.description}
            tags={['Event', event.date, event.ticketInfo || 'No Ticket Info']}
            onClick={() => onOpenStory(event.id, event.name)}
          />
        ))}
      </div>
    </div>
  );
};
