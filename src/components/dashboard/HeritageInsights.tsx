import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CardSkeleton } from '../layout/Skeleton';
import { BookOpen } from 'lucide-react';

export const HeritageInsights: React.FC = () => {
  const { heritage, aiLoadingState, aiError } = useAppStore();

  if (heritage.length === 0) {
    if (aiError && aiLoadingState === 'error') {
      return null;
    }
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center">Heritage & History</h3>
        <div className="space-y-3">
          <CardSkeleton /><CardSkeleton />
        </div>
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
