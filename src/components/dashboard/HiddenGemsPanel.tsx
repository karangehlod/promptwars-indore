import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { EyeOff, ArrowRight } from 'lucide-react';

export const HiddenGemsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { hiddenGems, selections, addSelection, removeSelection } = useAppStore();

  if (!hiddenGems.length) return null;

  const handleSelect = (gem: any) => {
    const isSelected = selections.some(s => s.id === gem.id);
    if (isSelected) {
      removeSelection(gem.id);
    } else {
      addSelection({
        id: gem.id,
        type: 'hiddenGem',
        name: gem.name,
        estCost: 0
      });
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <EyeOff className="text-accent" />
        <h3 className="text-2xl font-bold">Hidden Gems</h3>
      </div>
      
      <StaggeredGrid dataFetchId={hiddenGems.length}>
        {hiddenGems.map((gem) => {
          const isSelected = selections.some(s => s.id === gem.id);
          
          return (
            <Card 
              key={gem.id} 
              selected={isSelected}
              onSelect={() => handleSelect(gem)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                  Secret
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2 text-text-primary">{gem.name}</h4>
              <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                {gem.description}
              </p>
              
              <div className="bg-surface-elevated p-3 rounded-lg text-sm text-text-secondary mb-4 border border-border">
                <span className="font-semibold block mb-1 text-text-primary">Why it's hidden:</span>
                {gem.whyHidden}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStory(gem.id, gem.name);
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
