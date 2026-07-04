import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DayTimeline } from './DayTimeline';
import { BudgetBreakdown } from './BudgetBreakdown';
import { MapPreview } from './MapPreview';
import { ExportButton } from './ExportButton';
import { Compass } from 'lucide-react';

export const ItineraryView: React.FC = () => {
  const { itinerary, profile, destination } = useAppStore();

  if (!itinerary || !profile || !destination) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Your Itinerary: {destination.city}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {itinerary.days.length} Days • {profile.pace} Pace • {profile.budget.level} Budget
          </p>
        </div>
        <ExportButton elementId="itinerary-export-area" />
      </div>

      <div
        id="itinerary-export-area"
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-border-color shadow-sm space-y-8"
      >
        {/* PDF Header (only visible in export, usually hidden but we'll style it to look good) */}
        <div className="flex items-center justify-between pb-6 border-b border-border-color mb-6">
          <div className="flex items-center space-x-2">
            <Compass className="text-primary-600" size={28} />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
              TravelYarro
            </h1>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-gray-900 dark:text-gray-100">{destination.city}, {destination.country}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.dates.start} to {profile.dates.end}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <DayTimeline days={itinerary.days} />

          <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
            <MapPreview destinationName={destination.city} />
            <BudgetBreakdown
              totalBudget={itinerary.totalBudget}
              breakdown={itinerary.budgetBreakdown}
              profileAmount={profile.budget.amount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
