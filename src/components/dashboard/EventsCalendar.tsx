import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { getLocalEvents } from '../../services/agent';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';
import { RefreshCw } from 'lucide-react';

export const EventsCalendar: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { profile, destination, events, setEvents } = useAppStore();
  const { execute, loading, error } = useAsyncAction(getLocalEvents);

  useEffect(() => {
    if (events.length === 0 && destination && profile?.dates && !loading) {
      execute(destination, profile.dates).then(res => {
        if (res) setEvents(res);
      });
    }
  }, [destination, profile?.dates, events.length]);

  if (loading && events.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Local Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-700 dark:text-red-400 mb-2">{error.message}</p>
        <button 
          onClick={() => execute(destination!, profile!.dates).then(res => res && setEvents(res))}
          className="flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          <RefreshCw size={14} className="mr-1" /> Retry Events
        </button>
      </div>
    );
  }

  if (events.length === 0) return null;

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
