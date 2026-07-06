import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { EyeOff, ArrowRight } from 'lucide-react';
import { LocationImage } from '../ui/LocationImage';
import { matchMood } from '../../utils/moodFilter';

export const HiddenGemsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { hiddenGems, selections, addSelection, removeSelection, activeMood } = useAppStore();

  if (!hiddenGems.length) return null;

  const filteredGems = hiddenGems.filter(gem => matchMood(gem, activeMood));

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
      
      {filteredGems.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-2xl border border-border text-text-secondary">
          No hidden gems match your active vibe.
        </div>
      ) : (
        <StaggeredGrid dataFetchId={filteredGems.length}>
          {filteredGems.map((gem) => {
            const isSelected = selections.some(s => s.id === gem.id);
          
          return (
            <Card 
              key={gem.id} 
              selected={isSelected}
              onSelect={() => handleSelect(gem)}
              className="overflow-hidden p-0 flex flex-col h-full group"
            >
              {/* Card Image Header */}
              <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <LocationImage
                  name={gem.name}
                  category="nature"
                  type="hiddenGem"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                
                {/* Overlaid Badge */}
                <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-amber-500 text-white backdrop-blur-md rounded-md border border-white/10">
                  Secret Gem
                </span>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{gem.name}</h4>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                    {gem.description}
                  </p>
                  
                  <div className="bg-surface-elevated p-3 rounded-lg text-sm text-text-secondary mb-4 border border-border">
                    <span className="font-semibold block mb-1 text-text-primary">Why it's hidden:</span>
                    {gem.whyHidden}
                  </div>
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
              </div>
            </Card>
          );
        })}
      </StaggeredGrid>
      )}
    </section>
  );
};
