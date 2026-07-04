import React from 'react';
import { Compass } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const { activeStep, setActiveStep } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface-color/80 border-b border-border-color shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setActiveStep('profile')}
        >
          <Compass className="w-8 h-8 text-primary-600 dark:text-primary-500" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            TravelYarro
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button
              onClick={() => setActiveStep('profile')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${activeStep === 'profile' ? 'text-primary-600 dark:text-primary-400' : ''}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveStep('destination')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${activeStep === 'destination' ? 'text-primary-600 dark:text-primary-400' : ''}`}
            >
              Destination
            </button>
            <button
              onClick={() => setActiveStep('dashboard')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${activeStep === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveStep('itinerary')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${activeStep === 'itinerary' ? 'text-primary-600 dark:text-primary-400' : ''}`}
            >
              Itinerary
            </button>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
