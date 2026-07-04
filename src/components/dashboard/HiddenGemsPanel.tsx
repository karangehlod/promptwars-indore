import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';

export const HiddenGemsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { hiddenGems, aiLoadingState, aiError } = useAppStore();

  if (hiddenGems.length === 0) {
    if (aiError && aiLoadingState === 'error') {
      return null;
    }
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center">Hidden Gems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Hidden Gems</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hiddenGems.map(gem => (
          <PlaceCard 
            key={gem.id}
            id={gem.id}
            type="hiddenGem"
            name={gem.name}
            description={gem.description}
            tags={['Hidden', gem.whyHidden]}
            location={gem.location}
            onClick={() => onOpenStory(gem.id, gem.name)}
          />
        ))}
      </div>
    </div>
  );
};
