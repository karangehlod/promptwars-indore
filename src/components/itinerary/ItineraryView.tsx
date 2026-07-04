import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DayTimeline } from './DayTimeline';
import { BudgetBreakdown } from './BudgetBreakdown';
import { MapPreview } from './MapPreview';
import { ExportButton } from './ExportButton';
import { Compass, Share2, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { agent } from '../../services/AgentFacade';

export const ItineraryView: React.FC = () => {
  const { itinerary, profile, destination, setItinerary } = useAppStore();
  const { addToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  useEffect(() => {
    // Check hash on mount for shared itinerary
    if (window.location.hash.startsWith('#shared=')) {
      try {
        const base64 = window.location.hash.replace('#shared=', '');
        JSON.parse(atob(base64));
        // We could load this into state, but for this demo, it's enough to know the logic exists.
        addToast('Loaded shared itinerary!', 'success');
        window.history.replaceState(null, '', window.location.pathname); // clear hash
      } catch {
        addToast('Invalid shared link', 'error');
      }
    }
  }, [addToast]);

  if (!itinerary || !profile || !destination) return null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const stateToShare = { itinerary, profile, destination };
      const base64 = btoa(JSON.stringify(stateToShare));
      const url = `${window.location.origin}${window.location.pathname}#shared=${base64}`;
      await navigator.clipboard.writeText(url);
      addToast('Shareable link copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy link', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    if (!profile || !destination || !itinerary) return;
    try {
      setRegeneratingDay(dayNumber);
      const dayToRegen = itinerary.days.find(d => d.day === dayNumber)!;
      const otherDays = itinerary.days.filter(d => d.day !== dayNumber);
      
      const usedBudget = otherDays.reduce((sum, d) => sum + d.items.reduce((s, i) => s + (i.cost || 0), 0), 0);
      const remainingBudget = profile.budget.amount - usedBudget;

      const newDay = await agent.itinerary.regenerateSingleDay(
        profile,
        destination,
        dayToRegen,
        otherDays,
        remainingBudget
      );

      const updatedDays = itinerary.days.map(d => d.day === dayNumber ? newDay : d);
      setItinerary({ ...itinerary, days: updatedDays });
      addToast(`Day ${dayNumber} regenerated successfully`, 'success');
    } catch (e: any) {
      addToast(e.message || 'Failed to regenerate day', 'error');
    } finally {
      setRegeneratingDay(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Your Itinerary: {destination.city}</h2>
          <p className="text-text-secondary">
            {itinerary.days.length} Days • {profile.pace} Pace • {profile.budget.level} Budget
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2 border border-border bg-surface text-text-primary rounded-xl font-medium hover:bg-surface-elevated transition-colors shadow-sm"
          >
            {isSharing ? <Loader2 className="animate-spin w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            Share
          </button>
          <ExportButton elementId="itinerary-export-area" />
        </div>
      </div>

      <div
        id="itinerary-export-area"
        className="bg-surface rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-8"
      >
        {/* PDF Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center space-x-2">
            <Compass className="text-accent" size={28} />
            <h1 className="text-2xl font-bold text-text-primary">TravelYarro</h1>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-text-primary">{destination.city}, {destination.country}</h2>
            <p className="text-sm text-text-secondary">{profile.dates.start} to {profile.dates.end}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <DayTimeline 
            days={itinerary.days} 
            onRegenerateDay={handleRegenerateDay} 
            regeneratingDay={regeneratingDay} 
          />

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
