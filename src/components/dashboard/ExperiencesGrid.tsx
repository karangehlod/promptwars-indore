import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { getAuthenticExperiences } from '../../services/agent';
import { PlaceCard } from './PlaceCard';
import { CardSkeleton } from '../layout/Skeleton';
import { RefreshCw } from 'lucide-react';

export const ExperiencesGrid: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { profile, destination, experiences, setExperiences } = useAppStore();
  const { execute, loading, error } = useAsyncAction(getAuthenticExperiences);

  useEffect(() => {
    if (experiences.length === 0 && profile && destination && !loading) {
      execute(profile, destination).then(res => {
        if (res) setExperiences(res);
      });
    }
  }, [profile, destination, experiences.length]);

  if (loading && experiences.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Authentic Experiences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && experiences.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-700 dark:text-red-400 mb-2">{error.message}</p>
        <button 
          onClick={() => execute(profile!, destination!).then(res => res && setExperiences(res))}
          className="flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          <RefreshCw size={14} className="mr-1" /> Retry Experiences
        </button>
      </div>
    );
  }

  if (experiences.length === 0) return null;

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
