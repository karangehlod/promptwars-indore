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
  const [currency, setCurrency] = useState(initialBudget?.currency || 'USD');
  const [level, setLevel] = useState<Budget['level']>(initialBudget?.level || 'mid');
  const [style, setStyle] = useState<string[]>(initialStyle || []);
  const [error, setError] = useState('');

  const toggleStyle = (s: string) => {
    if (style.includes(s)) setStyle(style.filter(x => x !== s));
    else setStyle([...style, s]);
  };

  const handleNext = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }
    if (style.length === 0) {
      setError('Please select at least one travel style.');
      return;
    }
    onNext({
      budget: { amount: parsedAmount, currency, level },
      travelStyle: style
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Budget & Style</h2>
        <p className="text-gray-500 dark:text-gray-400">Set your spending limits and preferred travel style.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total Budget</label>
          <div className="flex gap-2">
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
            <input 
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="flex-1 px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800"
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
