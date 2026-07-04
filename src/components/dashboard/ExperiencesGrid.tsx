import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';

export const ExperiencesGrid: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { experiences, aiLoadingState, aiError } = useAppStore();

  if (experiences.length === 0) {
    if (aiError && aiLoadingState === 'error') {
      return null;
    }
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center">Authentic Experiences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Authentic Experiences</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiences.map(exp => (
          <PlaceCard 
            key={exp.id}
            id={exp.id}
            type="experience"
            name={exp.name}
            description={exp.description}
            estCost={exp.estCost}
            tags={['Experience', exp.type, exp.duration]}
            onClick={() => onOpenStory(exp.id, exp.name)}
          />
        ))}
      </div>
    </div>
  );
};
