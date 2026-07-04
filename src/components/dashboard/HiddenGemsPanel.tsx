import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { getHiddenGems } from '../../services/agent';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';
import { RefreshCw } from 'lucide-react';

export const HiddenGemsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { profile, destination, hiddenGems, setHiddenGems } = useAppStore();
  const { execute, loading, error } = useAsyncAction(getHiddenGems);

  useEffect(() => {
    if (hiddenGems.length === 0 && profile && destination && !loading) {
      execute(profile, destination).then(res => {
        if (res) setHiddenGems(res);
      });
    }
  }, [profile, destination, hiddenGems.length]);

  if (loading && hiddenGems.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Hidden Gems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && hiddenGems.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-700 dark:text-red-400 mb-2">{error.message}</p>
        <button 
          onClick={() => execute(profile!, destination!).then(res => res && setHiddenGems(res))}
          className="flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          <RefreshCw size={14} className="mr-1" /> Retry Hidden Gems
        </button>
      </div>
    );
  }

  if (hiddenGems.length === 0) return null;

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
