import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BudgetBreakdown } from './BudgetBreakdown';
import { MapPreview } from './MapPreview';
import { ExportButton } from './ExportButton';
import { Compass, Share2, Loader2, ChevronLeft, ChevronRight, RefreshCw, Navigation } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { agent } from '../../services/AgentFacade';
import { formatCurrency } from '../../utils/formatters';
import { RateLimitError } from '../../services/ai/AgentError';

export const ItineraryView: React.FC = () => {
  const { itinerary, profile, destination, setItinerary } = useAppStore();
  const { addToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    // Check hash on mount for shared itinerary
    if (window.location.hash.startsWith('#shared=')) {
      try {
        const base64 = window.location.hash.replace('#shared=', '');
        JSON.parse(atob(base64));
        addToast('Loaded shared itinerary!', 'success');
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        addToast('Invalid shared link', 'error');
      }
    }
  }, [addToast]);

  if (!itinerary || !profile || !destination) return null;

  const currentDay = itinerary.days[currentDayIndex];
  const totalDays = itinerary.days.length;

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
    } catch (e) {
      if (e instanceof RateLimitError) {
        const retryMinutes = Math.ceil((e.retryAfter || 60000) / 60000);
        addToast(`API quota exceeded. Please wait ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''} and try again.`, 'error');
      } else {
        addToast(e instanceof Error ? e.message : 'Failed to regenerate day', 'error');
      }
    } finally {
      setRegeneratingDay(null);
    }
  };

  const goToDay = (index: number) => {
    if (index >= 0 && index < totalDays) {
      setCurrentDayIndex(index);
    }
  };

  const mapsUrl = (activity: string) => 
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity + (destination ? `, ${destination.city}, ${destination.country}` : ''))}`;

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
        className="space-y-6"
      >
        {/* Day Card - Single day view with pagination */}
        <div data-day-card className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Day Header */}
          <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <span className="text-xl font-bold text-accent">{currentDay.day}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Day {currentDay.day}</h3>
                <p className="text-sm text-text-secondary">{currentDay.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary hidden sm:block">
                Day {currentDay.day} of {totalDays}
              </span>
              <button
                onClick={() => handleRegenerateDay(currentDay.day)}
                disabled={regeneratingDay === currentDay.day}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-elevated border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors disabled:opacity-50"
                title="Regenerate this day's itinerary"
              >
                {regeneratingDay === currentDay.day ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            </div>
          </div>

          {/* Day Items - Card List */}
          <div className="p-6 space-y-4">
            {currentDay.items.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No activities planned for this day</p>
              </div>
            ) : (
              currentDay.items.map((item, idx) => {
                const url = mapsUrl(item.activity);
                return (
                  <div
                    key={idx}
                    className="group relative bg-surface-elevated rounded-xl border border-border p-5 hover:shadow-md hover:border-accent/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-text-primary flex-1">{item.activity}</h4>
                          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-text-secondary whitespace-nowrap shrink-0">{item.time}</span>
                        </div>
                        {item.notes && <p className="text-sm text-text-secondary mb-3">{item.notes}</p>}
                      </div>
                      
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors shrink-0"
                        title="Get directions on Google Maps"
                      >
                        <Navigation size={12} className="rotate-45" />
                        Directions
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center mt-2 pt-2 border-t border-border-color/30">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {item.cost !== undefined && item.cost > 0 && (
                          <div className="text-xs font-medium text-accent bg-accent/10 inline-block px-2 py-1 rounded">
                            {formatCurrency(item.cost, 'INR')}
                          </div>
                        )}
                        {item.costJustification && (
                          <p className="text-xs text-text-secondary italic">
                            ({item.costJustification})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalDays > 1 && (
            <div data-pagination className="px-6 py-4 border-t border-border bg-surface/50 flex items-center justify-between">
              <button
                onClick={() => goToDay(currentDayIndex - 1)}
                disabled={currentDayIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary hover:bg-accent/10 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous Day</span>
              </button>
              
              <div className="flex items-center gap-2">
                {itinerary.days.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToDay(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentDayIndex
                        ? 'bg-accent w-8'
                        : 'bg-border hover:bg-accent/50'
                    }`}
                    aria-label={`Go to Day ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => goToDay(currentDayIndex + 1)}
                disabled={currentDayIndex === totalDays - 1}
                className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary hover:bg-accent/10 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next Day</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Budget Breakdown */}
        <BudgetBreakdown breakdown={itinerary.budgetBreakdown} totalBudget={itinerary.totalBudget} profileAmount={profile.budget.amount} />

        {/* Map Preview */}
        <MapPreview destination={destination} days={itinerary.days} />
      </div>
    </div>
  );
};
