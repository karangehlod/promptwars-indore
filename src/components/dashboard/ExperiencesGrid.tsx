import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { Compass, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { resolvePlaceImage } from '../../utils/imageResolver';

import { matchMood } from '../../utils/moodFilter';

export const ExperiencesGrid: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { experiences, selections, addSelection, removeSelection, activeMood } = useAppStore();

  if (!experiences.length) return null;

  const filteredExperiences = experiences.filter(exp => matchMood(exp, activeMood));

  const handleSelect = (exp: any) => {
    const isSelected = selections.some(s => s.id === exp.id);
    if (isSelected) {
      removeSelection(exp.id);
    } else {
      addSelection({
        id: exp.id,
        type: 'experience',
        name: exp.name,
        estCost: exp.estCost
      });
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Compass className="text-accent" />
        <h3 className="text-2xl font-bold">Authentic Experiences</h3>
      </div>
      
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-2xl border border-border text-text-secondary">
          No authentic experiences match your active vibe.
        </div>
      ) : (
        <StaggeredGrid dataFetchId={filteredExperiences.length}>
          {filteredExperiences.map((exp) => {
            const isSelected = selections.some(s => s.id === exp.id);
          
          return (
            <Card 
              key={exp.id} 
              selected={isSelected}
              onSelect={() => handleSelect(exp)}
              className="overflow-hidden p-0 flex flex-col h-full group"
            >
              {/* Card Image Header */}
              <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={resolvePlaceImage(exp.name, exp.type, 'experience')} 
                  alt={exp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                
                {/* Overlaid Badge */}
                <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-500 text-white backdrop-blur-md rounded-md border border-white/10">
                  {exp.type}
                </span>

                {/* Overlaid Cost */}
                <span className="absolute bottom-3 right-3 text-xs font-bold text-white px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md">
                  {formatCurrency(exp.estCost, 'INR')}
                </span>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{exp.name}</h4>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                    {exp.description}
                  </p>
                  
                  <div className="text-xs text-text-secondary mb-4">
                    <span className="font-medium text-text-primary">Duration:</span> {exp.duration}
                  </div>
                </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStory(exp.id, exp.name);
                }}
                className="mt-auto flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Read the story <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              </div>
            </Card>
          );
        })}
      </StaggeredGrid>
      )}
    </section>
  );
};
