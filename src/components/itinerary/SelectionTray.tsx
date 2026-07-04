import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ListChecks, X, Calendar } from 'lucide-react';

export const SelectionTray: React.FC = () => {
  const { selections, removeSelection, profile, setActiveStep } = useAppStore();
  const isOverBudget = profile && profile.budget.amount < selections.reduce((sum, item) => sum + (item.estCost || 0), 0);

  if (selections.length === 0) return null;

  const totalCost = selections.reduce((sum, item) => sum + (item.estCost || 0), 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-color/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-border-color shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] transition-transform">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
        <div className="flex-1 min-w-0 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex items-center gap-2">
            <span className="font-semibold whitespace-nowrap mr-2 text-gray-900 dark:text-gray-100 flex items-center">
              <ListChecks size={18} className="mr-2" />
              {selections.length} Selected
            </span>
            {selections.map(item => (
              <div key={item.id} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full pl-3 pr-1 py-1 whitespace-nowrap text-sm border border-border-color">
                <span className="truncate max-w-[120px] mr-2 text-gray-700 dark:text-gray-300">{item.name}</span>
                <button 
                  onClick={() => removeSelection(item.id)}
                  className="p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-color pt-3 md:pt-0">
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Est. Total Cost</div>
            <div className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
              ${totalCost}
            </div>
          </div>
          
          <button 
            onClick={() => setActiveStep('itinerary')}
            className="flex items-center bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Calendar size={18} className="mr-2" />
            Build Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};
