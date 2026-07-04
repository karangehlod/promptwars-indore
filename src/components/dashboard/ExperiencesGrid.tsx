import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { Compass, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full capitalize">
                  {exp.type}
                </span>
                <span className="font-bold text-text-primary">
                  {formatCurrency(exp.estCost, 'INR')}
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-text-primary">{exp.name}</h4>
              <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                {exp.description}
              </p>
              
              <div className="text-xs text-text-secondary mb-4">
                <span className="font-medium text-text-primary">Duration:</span> {exp.duration}
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
            </Card>
          );
        })}
      </StaggeredGrid>
      )}
    </section>
  );
};
