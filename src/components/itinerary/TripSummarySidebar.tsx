import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CreditCard, Compass, CalendarDays, Pencil } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

export function TripSummarySidebar() {
  const selections = useAppStore(s => s.selections);
  const removeSelection = useAppStore(s => s.removeSelection);
  const profile = useAppStore(s => s.profile);
  const aiLoadingState = useAppStore(s => s.aiLoadingState);
  const setActiveStep = useAppStore(s => s.setActiveStep);

  const totalCost = useMemo(() => {
    return selections.reduce((sum, item) => sum + (item.estCost || 0), 0);
  }, [selections]);

  const budget = profile?.budget.amount || 0;
  const isOverBudget = totalCost > budget;
  const dates = profile?.dates;

  if (aiLoadingState !== 'done' && aiLoadingState !== 'error') {
    return null;
  }

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col bg-surface-elevated overflow-hidden border-border/50">
      <div className="p-4 border-b border-border bg-surface">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Compass className="w-5 h-5 text-accent" />
          Trip Summary
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          {selections.length} items selected
        </p>
        {/* Dates row — single source of truth display + edit shortcut */}
        {dates && (
          <div className="mt-2 flex items-center justify-between text-xs text-text-secondary bg-surface-elevated rounded-lg px-2.5 py-1.5 border border-border">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} />
              {dates.start} → {dates.end}
            </span>
            <button
              onClick={() => setActiveStep('profile')}
              title="Edit trip dates"
              className="flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <Pencil size={11} />
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {selections.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center text-text-secondary mt-10 text-sm"
            >
              Select items from the dashboard to start building your itinerary.
            </motion.div>
          ) : (
            selections.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-surface p-3 rounded-xl border border-border shadow-sm flex flex-col gap-2 group relative"
              >
                <div className="flex justify-between items-start pr-6">
                  <span className="font-medium text-sm text-text-primary leading-tight">{item.name}</span>
                  <button
                    onClick={() => removeSelection(item.id)}
                    className="absolute top-2 right-2 p-1 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-text-secondary">
                    {item.type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium text-text-primary">
                    {item.estCost ? formatCurrency(item.estCost, 'INR') : 'Free'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border bg-surface">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
            <CreditCard size={16} /> Est. Total
          </span>
          <div className="text-right">
            <div className={`font-bold text-lg ${isOverBudget ? 'text-red-500' : 'text-text-primary'}`}>
              {formatCurrency(totalCost, 'INR')}
            </div>
            <div className="text-xs text-text-secondary">
              Budget: {formatCurrency(budget, 'INR')}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-accent'}`}
            style={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }}
          />
        </div>

        <button 
          disabled={selections.length === 0}
          className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          Generate Itinerary
        </button>
      </div>
    </Card>
  );
}
