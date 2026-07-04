import React from 'react';
import type { DayPlan } from '../../schemas/itinerary';
import { useAppStore } from '../../store/useAppStore';
import { RefreshCw, Loader2, Navigation } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface DayTimelineProps {
  days: DayPlan[];
  onRegenerateDay?: (dayNumber: number) => void;
  regeneratingDay?: number | null;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ days, onRegenerateDay, regeneratingDay }) => {
  const destination = useAppStore(s => s.destination);

  return (
    <div className="space-y-8 flex-1 overflow-x-auto">
      <div className="flex md:flex-col gap-6 md:gap-8 pb-4 md:pb-0">
        {days.map(day => (
          <div key={day.day} className="min-w-[300px] md:min-w-0 md:w-full flex-shrink-0 relative">
            
            <div className="sticky top-16 z-10 bg-surface/90 backdrop-blur-md py-2 border-b border-border mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-text-primary">Day {day.day}</h3>
                <p className="text-sm text-text-secondary">{day.date}</p>
              </div>
              {onRegenerateDay && (
                <button
                  onClick={() => onRegenerateDay(day.day)}
                  disabled={regeneratingDay === day.day}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-elevated border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors disabled:opacity-50"
                  title="Regenerate this day's itinerary"
                >
                  {regeneratingDay === day.day ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Regenerate</span>
                </button>
              )}
            </div>
            
            <div className={`space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent transition-opacity ${regeneratingDay === day.day ? 'opacity-50' : ''}`}>
              {day.items.map((item, idx) => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  item.activity + (destination ? `, ${destination.city}, ${destination.country}` : '')
                )}`;

                return (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    {/* Timeline Dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-accent/10 shadow-sm shrink-0 md:order-1 md:group-odd:-ml-5 md:group-even:-mr-5 z-10">
                      <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                    </div>
                    
                    {/* Content Card */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 bg-surface rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h4 className="font-semibold text-text-primary">{item.activity}</h4>
                          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-text-secondary whitespace-nowrap">{item.time}</span>
                        </div>
                        {item.notes && <p className="text-sm text-text-secondary mb-3">{item.notes}</p>}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center justify-between mt-2 pt-2 border-t border-border-color/30">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {item.cost !== undefined && item.cost > 0 && (
                            <div className="text-xs font-medium text-accent bg-accent/10 inline-block px-2 py-1 rounded">
                              {formatCurrency(item.cost, 'INR')}
                            </div>
                          )}
                          {item.costJustification && (
                            <p className="text-xs text-text-secondary italic">
                              ({item.costJustification})
                            </p>
                          )}
                        </div>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                          title="Get directions on Google Maps"
                        >
                          <Navigation size={12} className="rotate-45" />
                          Directions
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
