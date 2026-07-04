import React, { useState } from 'react';
import type { Budget } from '../../../schemas/profile';

interface BudgetStyleStepProps {
  initialBudget: Budget | undefined;
  initialStyle: string[];
  onBack: () => void;
  onNext: (data: { budget: Budget; travelStyle: string[] }) => void;
}

const PREDEFINED_STYLES = ['Backpacker', 'Comfort', 'Luxury', 'Family', 'Solo', 'Romantic'];

export const BudgetStyleStep: React.FC<BudgetStyleStepProps> = ({ initialBudget, initialStyle, onBack, onNext }) => {
  const [amount, setAmount] = useState(initialBudget?.amount?.toString() || '');
  const [level, setLevel] = useState<Budget['level']>(initialBudget?.level || 'mid');
  const [style, setStyle] = useState<string[]>(initialStyle || []);
  const [error, setError] = useState('');

  const toggleStyle = (s: string) => {
    if (style.includes(s)) setStyle(style.filter(x => x !== s));
    else setStyle([...style, s]);
  };

  const getBudgetLevel = (amt: number): Budget['level'] => {
    if (amt < 20000) return 'budget';
    if (amt < 80000) return 'mid';
    return 'luxury';
  };

  const handleNext = () => {
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid budget amount.');
      return;
    }
    if (style.length === 0) {
      setError('Please select at least one travel style.');
      return;
    }

    onNext({
      budget: {
        amount: Number(amount),
        currency: 'INR',
        level: getBudgetLevel(Number(amount))
      },
      travelStyle: style
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold mb-4">Budget & Style</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">How do you prefer to travel?</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Total Budget (INR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input 
              type="number"
              placeholder="e.g. 50000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-border-color rounded-xl bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Budget Level</label>
          <div className="flex gap-2">
            {(['budget', 'mid', 'luxury'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-2 capitalize rounded-md border text-sm font-medium transition-colors
                  ${level === l 
                    ? 'bg-primary-50 text-primary-700 border-primary-500 dark:bg-primary-900/30 dark:text-primary-300' 
                    : 'bg-surface-color border-border-color'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Travel Style</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_STYLES.map(s => (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors
                  ${style.includes(s) 
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                    : 'bg-surface-color text-gray-700 border-border-color dark:text-gray-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-between pt-4 border-t border-border-color">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-border-color rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};
