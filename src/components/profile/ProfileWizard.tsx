import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { InterestsStep } from './steps/InterestsStep';
import { BudgetStyleStep } from './steps/BudgetStyleStep';
import { DatesPaceStep } from './steps/DatesPaceStep';
import { DietaryAccessibilityStep } from './steps/DietaryAccessibilityStep';
import { ProfileSchema } from '../../schemas/profile';

export const ProfileWizard: React.FC = () => {
  const { profile, setProfile, setActiveStep } = useAppStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Parameters<typeof setProfile>[0]>>(profile || {});

  const updateData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = (finalData: any) => {
    const completeData = { ...formData, ...finalData };
    const parsed = ProfileSchema.safeParse(completeData);
    
    if (parsed.success) {
      setProfile(parsed.data);
      setActiveStep('destination');
    } else {
      console.error("Profile validation failed", parsed.error);
      alert("Please ensure all required fields are filled correctly.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface-color dark:bg-surface-color p-6 md:p-8 rounded-2xl shadow-sm border border-border-color md:mt-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className={`w-1/4 h-2 rounded-full mx-1 transition-colors ${i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500 text-center font-medium">Step {step} of 4</div>
      </div>

      {/* Steps */}
      {step === 1 && (
        <InterestsStep 
          initialData={formData.interests || []} 
          onNext={(data) => { updateData(data); setStep(2); }} 
        />
      )}
      {step === 2 && (
        <BudgetStyleStep 
          initialBudget={formData.budget} 
          initialStyle={formData.travelStyle || []}
          onBack={() => setStep(1)}
          onNext={(data) => { updateData(data); setStep(3); }} 
        />
      )}
      {step === 3 && (
        <DatesPaceStep 
          initialDates={formData.dates} 
          initialPace={formData.pace}
          onBack={() => setStep(2)}
          onNext={(data) => { updateData(data); setStep(4); }} 
        />
      )}
      {step === 4 && (
        <DietaryAccessibilityStep 
          initialDietary={formData.dietary || []} 
          initialAccessibility={formData.accessibility || []}
          onBack={() => setStep(3)}
          onSubmit={handleComplete} 
        />
      )}
    </div>
  );
};
