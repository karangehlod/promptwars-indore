import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { getHeritageInsights } from '../../services/agent';
import { CardSkeleton } from '../layout/Skeleton';
import { RefreshCw, BookOpen } from 'lucide-react';

export const HeritageInsights: React.FC = () => {
  const { destination, heritage, setHeritage } = useAppStore();
  const { execute, loading, error } = useAsyncAction(getHeritageInsights);

  useEffect(() => {
    if (heritage.length === 0 && destination && !loading) {
      execute(destination).then(res => {
        if (res) setHeritage(res);
      });
    }
  }, [destination, heritage.length]);

  if (loading && heritage.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Heritage & History</h3>
        <div className="space-y-3">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && heritage.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-700 dark:text-red-400 mb-2">{error.message}</p>
        <button 
          onClick={() => execute(destination!).then(res => res && setHeritage(res))}
          className="flex items-center text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
        >
          <RefreshCw size={14} className="mr-1" /> Retry Heritage Insights
        </button>
      </div>
    );
  }

  if (heritage.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Heritage & History</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heritage.map((insight, idx) => (
          <div key={idx} className="p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
            <div className="flex items-start mb-2">
              <BookOpen size={18} className="text-primary-600 dark:text-primary-400 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h4>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{insight.period}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{insight.summary}</p>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">Significance: {insight.significance}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
