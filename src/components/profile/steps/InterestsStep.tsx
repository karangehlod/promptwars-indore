import React, { useState } from 'react';

interface InterestsStepProps {
  initialData: string[];
  onNext: (data: { interests: string[] }) => void;
}

const PREDEFINED_INTERESTS = [
  'History', 'Art', 'Food', 'Nature', 'Nightlife', 
  'Architecture', 'Shopping', 'Adventure', 'Relaxation', 'Culture'
];

export const InterestsStep: React.FC<InterestsStepProps> = ({ initialData, onNext }) => {
  const [selected, setSelected] = useState<string[]>(initialData || []);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else {
      setSelected([...selected, interest]);
    }
    if (error) setError('');
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one interest.');
      return;
    }
    onNext({ interests: selected });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What are your interests?</h2>
        <p className="text-gray-500 dark:text-gray-400">Select all that apply to help us tailor your experience.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {PREDEFINED_INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
              ${selected.includes(interest) 
                ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                : 'bg-surface-color text-gray-700 border-border-color hover:border-primary-300 dark:text-gray-300 dark:hover:border-primary-700'
              }`}
          >
            {interest}
          </button>
        ))}
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end pt-4 border-t border-border-color">
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
