import React, { useState } from 'react';
import type { UserProfile } from '../../../schemas/profile';

interface DatesPaceStepProps {
  initialDates: UserProfile['dates'] | undefined;
  initialPace: UserProfile['pace'] | undefined;
  onBack: () => void;
  onNext: (data: { dates: UserProfile['dates']; pace: UserProfile['pace'] }) => void;
}

export const DatesPaceStep: React.FC<DatesPaceStepProps> = ({ initialDates, initialPace, onBack, onNext }) => {
  const [start, setStart] = useState(initialDates?.start || '');
  const [end, setEnd] = useState(initialDates?.end || '');
  const [pace, setPace] = useState<UserProfile['pace']>(initialPace || 'moderate');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!start || !end) {
      setError('Please select start and end dates.');
      return;
    }
    if (new Date(start) > new Date(end)) {
      setError('End date must be after start date.');
      return;
    }
    onNext({ dates: { start, end }, pace });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">When & How</h2>
        <p className="text-gray-500 dark:text-gray-400">Tell us about your travel timeline and preferred pace.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input 
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input 
              type="date"
              value={end}
              min={start}
              onChange={e => setEnd(e.target.value)}
              className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Travel Pace</label>
          <div className="space-y-3">
            {(['relaxed', 'moderate', 'packed'] as const).map(p => (
              <label 
                key={p} 
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors
                  ${pace === p ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border-color hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <input 
                  type="radio" 
                  name="pace" 
                  value={p} 
                  checked={pace === p}
                  onChange={() => setPace(p)}
                  className="mt-1"
                />
                <div className="ml-3">
                  <span className="block font-medium capitalize text-gray-900 dark:text-gray-100">{p}</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {p === 'relaxed' && 'Take it easy, plenty of free time.'}
                    {p === 'moderate' && 'Balanced mix of activities and rest.'}
                    {p === 'packed' && 'See and do as much as possible.'}
                  </span>
                </div>
              </label>
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
