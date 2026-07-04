import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';

export const RecommendationsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { recommendations, aiLoadingState, aiError } = useAppStore();

  if (recommendations.length === 0) {
    if (aiError && aiLoadingState === 'error') {
      return null;
    }
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center">Top Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg flex items-center">Top Recommendations <span className="ml-2 text-xs font-normal px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">Tailored</span></h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(rec => (
          <PlaceCard 
            key={rec.id}
            id={rec.id}
            type="recommendation"
            name={rec.name}
            description={rec.description}
            estCost={rec.estCost}
            tags={[rec.category, ...rec.tags]}
            onClick={() => onOpenStory(rec.id, rec.name)}
          />
        ))}
      </div>
    </div>
  );
};
