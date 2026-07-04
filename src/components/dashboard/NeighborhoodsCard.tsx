import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getNeighborhoodSuggestions } from '../../utils/cityMoodData';
import { MapPin, Compass } from 'lucide-react';

export const NeighborhoodsCard: React.FC = () => {
  const destination = useAppStore(s => s.destination);
  const activeMood = useAppStore(s => s.activeMood);

  if (!destination || !activeMood) return null;

  const suggestions = getNeighborhoodSuggestions(destination.city, activeMood);

  return (
    <div className="bg-surface-color/50 dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-border-color shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <Compass className="text-accent w-5 h-5 animate-spin-slow" />
        <h3 className="font-bold text-lg">Areas to Explore for {activeMood} Mood</h3>
      </div>
      <p className="text-sm text-text-secondary">
        We recommend visiting these local neighborhoods in {destination.city} that match your active vibe:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {suggestions.map((area, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-border-color hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="text-primary-500 shrink-0 mt-0.5" size={16} />
                <h4 className="font-bold text-text-primary text-base">{area.name}</h4>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{area.description}</p>
            </div>
            
            {area.highlights && area.highlights.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border-color/50">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Don't Miss:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {area.highlights.map((h, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
