import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Map, Gem, Monument, Calendar, MapPin, AlertTriangle } from 'lucide-react';

const steps = [
  { id: 'recommendations', label: 'Curating recommendations...', icon: Map },
  { id: 'hiddenGems', label: 'Discovering hidden gems...', icon: Gem },
  { id: 'heritage', label: 'Uncovering heritage...', icon: Monument },
  { id: 'experiences', label: 'Finding local experiences...', icon: MapPin },
  { id: 'events', label: 'Checking local events...', icon: Calendar }
];

export const AILoadingOverlay: React.FC = () => {
  const { aiLoadingState, aiError, setAiLoadingState, setAiError } = useAppStore();

  if (aiLoadingState === 'idle' || aiLoadingState === 'done') {
    return null;
  }

  const currentStepIndex = steps.findIndex(s => s.id === aiLoadingState);
  const isError = aiLoadingState === 'error';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md"
      >
        <div className="max-w-md w-full bg-surface-color dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-border-color m-4 relative overflow-hidden">
          
          {/* Animated Background Gradient */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-secondary-500/20 dark:bg-secondary-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: isError ? 0 : 360 }}
                transition={{ duration: 8, repeat: isError ? 0 : Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-dashed border-primary-500/30 flex items-center justify-center"
              >
                {isError ? (
                  <AlertTriangle className="text-red-500 w-8 h-8" />
                ) : (
                  <Sparkles className="text-primary-600 dark:text-primary-400 w-8 h-8" />
                )}
              </motion.div>
            </div>

            {isError ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">API Usage Limit Reached</h3>
                <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You've hit the AI usage limit for now. Please wait a moment before trying again, or configure multiple API keys.
                </p>
                <button
                  onClick={() => {
                    setAiLoadingState('idle');
                    setAiError(null);
                  }}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
                >
                  Close & Retry Later
                </button>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Crafting Your Dashboard
                </h3>
                
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isPast = index < currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <motion.div 
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: isActive || isPast ? 1 : 0.4,
                          x: 0,
                          scale: isActive ? 1.05 : 1
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                          isActive 
                            ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800' 
                            : 'bg-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isPast ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' :
                          'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <span className={`text-sm font-medium ${
                          isPast ? 'text-gray-700 dark:text-gray-300' :
                          isActive ? 'text-primary-700 dark:text-primary-300' :
                          'text-gray-400 dark:text-gray-600'
                        }`}>
                          {step.label}
                        </span>
                        
                        {isActive && (
                          <motion.div 
                            className="ml-auto w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
