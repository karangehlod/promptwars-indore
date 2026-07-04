import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { Calendar, ArrowRight } from 'lucide-react';

export const EventsCalendar: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { events, selections, addSelection, removeSelection } = useAppStore();

  if (!events.length) return null;

  const handleSelect = (event: any) => {
    const isSelected = selections.some(s => s.id === event.id);
    if (isSelected) {
      removeSelection(event.id);
    } else {
      addSelection({
        id: event.id,
        type: 'event',
        name: event.name,
        estCost: 0
      });
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-accent" />
        <h3 className="text-2xl font-bold">Local Events & Festivals</h3>
      </div>
      
      <StaggeredGrid dataFetchId={events.length}>
        {events.map((event) => {
          const isSelected = selections.some(s => s.id === event.id);
          
          return (
            <Card 
              key={event.id} 
              selected={isSelected}
              onSelect={() => handleSelect(event)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                  {event.date}
                </span>
                {event.ticketInfo && (
                  <span className="text-xs font-medium text-text-secondary">
                    {event.ticketInfo}
                  </span>
                )}
              </div>
              <h4 className="text-xl font-bold mb-2 text-text-primary">{event.name}</h4>
              <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                {event.description}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStory(event.id, event.name);
                }}
                className="mt-auto flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Read the story <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </Card>
          );
        })}
      </StaggeredGrid>
    </section>
  );
};
