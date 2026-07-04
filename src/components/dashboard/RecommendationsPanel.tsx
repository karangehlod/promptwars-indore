import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { getRecommendations } from '../../services/agent';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';
import { RefreshCw } from 'lucide-react';

export const RecommendationsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { profile, destination, recommendations, setRecommendations } = useAppStore();
  const { execute, loading, error } = useAsyncAction(getRecommendations);

  useEffect(() => {
    if (recommendations.length === 0 && profile && destination && !loading) {
      execute(profile, destination).then(res => {
        if (res) setRecommendations(res);
      });
    }
  }, [profile, destination, recommendations.length]); // Intentionally omitting execute/set to avoid loops

  if (loading && recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Top Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-700 dark:text-red-400 mb-2">{error.message}</p>
        <button 
          onClick={() => execute(profile!, destination!).then(res => res && setRecommendations(res))}
          className="flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          <RefreshCw size={14} className="mr-1" /> Retry Recommendations
        </button>
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
