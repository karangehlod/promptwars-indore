import React from 'react';
import { Compass } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const { activeStep, setActiveStep, hasStarted, profile, destination } = useAppStore();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/80 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => {
            if (hasStarted) setActiveStep('profile');
          }}
        >
          <Compass className="w-8 h-8 text-primary-600 dark:text-primary-500" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            TravelYarro
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          {hasStarted && (
            <nav className="hidden md:flex items-center space-x-4 text-sm font-medium text-text-secondary">
              <button
                onClick={() => setActiveStep('profile')}
                className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${activeStep === 'profile' ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}`}
              >
                Profile
              </button>
              
              <button
                disabled={!profile}
                onClick={() => setActiveStep('destination')}
                className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  !profile ? '' : 'hover:text-primary-600 dark:hover:text-primary-400'
                } ${activeStep === 'destination' ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}`}
                title={!profile ? "Complete profile first" : ""}
              >
                Destination
              </button>
              
              <button
                disabled={!destination}
                onClick={() => setActiveStep('dashboard')}
                className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  !destination ? '' : 'hover:text-primary-600 dark:hover:text-primary-400'
                } ${activeStep === 'dashboard' ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}`}
                title={!destination ? "Select destination first" : ""}
              >
                Dashboard
              </button>
              
              <button
                disabled={!destination}
                onClick={() => setActiveStep('itinerary')}
                className={`transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  !destination ? '' : 'hover:text-primary-600 dark:hover:text-primary-400'
                } ${activeStep === 'itinerary' ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}`}
                title={!destination ? "Select destination first" : ""}
              >
                Itinerary
              </button>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
