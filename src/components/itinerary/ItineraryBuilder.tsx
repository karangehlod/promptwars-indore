import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { agent } from '../../services/AgentFacade';
import { ItineraryView } from './ItineraryView';
import { EmptyState } from '../layout/EmptyState';
import { CardSkeleton } from '../layout/Skeleton';
import { Calendar, Wand2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { RateLimitError } from '../../services/ai/AgentError';

export const ItineraryBuilder: React.FC = () => {
  const { profile, destination, selections, itinerary, setItinerary, setActiveStep } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!profile || !destination || selections.length === 0) return;

    setIsGenerating(true);
    setError('');

    // Calculate days based on profile dates
    const start = new Date(profile.dates.start);
    const end = new Date(profile.dates.end);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    try {
      const result = await agent.itinerary.generateItinerary(
        profile, 
        destination, 
        selections, 
        days, 
        profile.budget.amount
      );

      setItinerary(result);
    } catch (err) {
      if (err instanceof RateLimitError) {
        const retryMinutes = Math.ceil((err.retryAfter || 60000) / 60000);
        setError(`API quota exceeded. Please wait ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''} and try again.`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to generate itinerary');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile || !destination) {
    return (
      <EmptyState 
        title="Missing Information"
        description="Please complete your profile and destination selection first."
        action={
          <button 
            onClick={() => setActiveStep('profile')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md"
          >
            Go to Profile
          </button>
        }
      />
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="w-full lg:w-80 space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => setItinerary(null)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Rebuild Itinerary
          </button>
        </div>
        <ItineraryView />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 mb-2">
          <Wand2 size={32} />
        </div>
        <h2 className="text-3xl font-bold">Ready to Build Your Itinerary?</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          We'll use our deep AI model to craft a personalized day-by-day plan incorporating your {selections.length} selected items while staying within your ${profile.budget.amount} budget.
        </p>
      </div>

      <div className="bg-surface-color dark:bg-gray-800 p-6 rounded-2xl border border-border-color shadow-sm">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Calendar className="mr-2" size={20} /> Your Selections
        </h3>
        {selections.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            You haven't selected any items yet. Go back to the dashboard and add some activities, hidden gems, or events.
          </p>
        ) : (
          <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
            {selections.map(s => (
              <li key={s.id} className="flex justify-between items-center py-2 border-b border-border-color last:border-0">
                <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{s.type}</span>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start text-red-700 dark:text-red-400">
            <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-color">
          <button
            onClick={() => setActiveStep('dashboard')}
            className="flex-1 py-3 px-4 border border-border-color rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Add More Items
          </button>
          <button
            onClick={handleGenerate}
            disabled={selections.length === 0}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            <Wand2 size={18} className="mr-2" />
            Generate Magic Plan
          </button>
        </div>
      </div>
    </div>
  );
};
