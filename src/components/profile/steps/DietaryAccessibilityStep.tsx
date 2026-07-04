import React, { useState } from 'react';

interface DietaryAccessibilityStepProps {
  initialDietary: string[];
  initialAccessibility: string[];
  onBack: () => void;
  onSubmit: (data: { dietary: string[]; accessibility: string[] }) => void;
}

const PREDEFINED_DIETS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Nut Allergy', 'Dairy-Free'];
const PREDEFINED_ACCESS = ['Wheelchair Accessible', 'Minimal Walking', 'Ground Floor Preferred', 'Service Animal Allowed'];

export const DietaryAccessibilityStep: React.FC<DietaryAccessibilityStepProps> = ({ 
  initialDietary, initialAccessibility, onBack, onSubmit 
}) => {
  const [dietary, setDietary] = useState<string[]>(initialDietary || []);
  const [accessibility, setAccessibility] = useState<string[]>(initialAccessibility || []);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleNext = () => {
    onSubmit({ dietary, accessibility });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Preferences & Needs</h2>
        <p className="text-gray-500 dark:text-gray-400">Optional: Let us know any specific dietary or accessibility requirements.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Dietary Requirements (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_DIETS.map(d => (
              <button
                key={d}
                onClick={() => toggleItem(dietary, setDietary, d)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors
                  ${dietary.includes(d) 
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                    : 'bg-surface-color text-gray-700 border-border-color dark:text-gray-300'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Accessibility Needs (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_ACCESS.map(a => (
              <button
                key={a}
                onClick={() => toggleItem(accessibility, setAccessibility, a)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors
                  ${accessibility.includes(a) 
                    ? 'bg-primary-600 text-white border-primary-600 dark:bg-primary-500 dark:border-primary-500' 
                    : 'bg-surface-color text-gray-700 border-border-color dark:text-gray-300'
                  }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

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
          Complete Profile
        </button>
      </div>
    </div>
  );
};
