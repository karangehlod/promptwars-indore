import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { agent } from '../../services/AgentFacade';
import { RecommendationsPanel } from './RecommendationsPanel';
import { HiddenGemsPanel } from './HiddenGemsPanel';
import { HeritageInsights } from './HeritageInsights';
import { EventsCalendar } from './EventsCalendar';
import { ExperiencesGrid } from './ExperiencesGrid';
import { StorytellingModal } from '../story/StorytellingModal';
import { SelectionTray } from '../itinerary/SelectionTray';
import { AILoadingOverlay } from '../layout/AILoadingOverlay';
import { useToast } from '../../hooks/useToast';
import { TripSummarySidebar } from '../itinerary/TripSummarySidebar';
import { Logger } from '../../utils/logger';

import { MoodExplorer } from './MoodExplorer';
import { NeighborhoodsCard } from './NeighborhoodsCard';

export const DashboardGrid: React.FC = () => {
  // ── Stable individual selectors (no object destructure) ──────────────────
  const profile = useAppStore(s => s.profile);
  const destination = useAppStore(s => s.destination);
  const recommendations = useAppStore(s => s.recommendations);
  const hiddenGems = useAppStore(s => s.hiddenGems);
  const setRecommendations = useAppStore(s => s.setRecommendations);
  const setHiddenGems = useAppStore(s => s.setHiddenGems);
  const setHeritage = useAppStore(s => s.setHeritage);
  const setEvents = useAppStore(s => s.setEvents);
  const setExperiences = useAppStore(s => s.setExperiences);
  const aiLoadingState = useAppStore(s => s.aiLoadingState);
  const setAiLoadingState = useAppStore(s => s.setAiLoadingState);
  const setAiError = useAppStore(s => s.setAiError);
  // retryTrigger is an incrementing number — stable dep array stays size=3
  const retryTrigger = useAppStore(s => s.retryTrigger);

  const { addToast } = useToast();
  const [activeStory, setActiveStory] = useState<{ id: string; name: string } | null>(null);

  // Ref guard: prevents double-fire on re-renders within same trigger cycle
  const pipelineStarted = useRef(false);

  useEffect(() => {
    // ── Persistence guard: data already loaded, mark done and exit ──────────
    if (aiLoadingState === 'done') return;
    if (recommendations.length > 0 && hiddenGems.length > 0) {
      setAiLoadingState('done');
      return;
    }

    // ── Preconditions ────────────────────────────────────────────────────────
    if (!profile || !destination) return;
    if (aiLoadingState !== 'idle') return;

    // ── Single-run guard per trigger cycle ───────────────────────────────────
    if (pipelineStarted.current) return;
    pipelineStarted.current = true;

    let mounted = true;

    const loadPipeline = async () => {
      try {
        Logger.ai('Starting AI Dashboard Pipeline generation');

        // ── ROW 1: Recommendations ────────────────────────────────────────────
        Logger.ai('Generating recommendations...');
        setAiLoadingState('recommendations');
        const recRes = await agent.recommendations.getRecommendations(profile, destination);
        if (!mounted) return;
        Logger.ai(`Recommendations received (${recRes.length} items)`);
        setRecommendations(recRes);

        // ── ROW 2: Hidden Gems + Heritage (parallel) ──────────────────────────
        Logger.ai('Generating hidden gems & heritage...');
        setAiLoadingState('hiddenGems');
        const [hgRes, herRes] = await Promise.allSettled([
          agent.hiddenGems.getHiddenGems(profile, destination),
          agent.heritage.getHeritageInsights(destination),
        ]);
        if (!mounted) return;
        if (hgRes.status === 'fulfilled') {
          Logger.ai(`Hidden gems received (${hgRes.value.length} items)`);
          setHiddenGems(hgRes.value);
        } else {
          Logger.error(`Hidden gems failed: ${hgRes.reason?.message}`);
        }
        if (herRes.status === 'fulfilled') {
          Logger.ai(`Heritage insights received (${herRes.value.length} items)`);
          setHeritage(herRes.value);
        } else {
          Logger.error(`Heritage failed: ${herRes.reason?.message}`);
        }

        // ── ROW 3: Experiences + Events (parallel) ────────────────────────────
        Logger.ai('Generating experiences & events...');
        setAiLoadingState('experiences');
        const [expRes, evRes] = await Promise.allSettled([
          agent.experiences.getAuthenticExperiences(profile, destination),
          agent.events.getLocalEvents(destination, profile.dates),
        ]);
        if (!mounted) return;
        if (expRes.status === 'fulfilled') {
          Logger.ai(`Experiences received (${expRes.value.length} items)`);
          setExperiences(expRes.value);
        } else {
          Logger.error(`Experiences failed: ${expRes.reason?.message}`);
        }
        if (evRes.status === 'fulfilled') {
          Logger.ai(`Events received (${evRes.value.length} items)`);
          setEvents(evRes.value);
        } else {
          Logger.error(`Events failed: ${evRes.reason?.message}`);
        }

        Logger.ai('Dashboard pipeline complete');
        setAiLoadingState('done');
        addToast('Dashboard fully loaded!', 'success');
      } catch (err: any) {
        if (!mounted) return;
        const msg = err?.message || 'An unexpected error occurred during AI generation';
        Logger.error(`Pipeline error: ${msg}`);
        pipelineStarted.current = false; // Allow retry on next triggerRetry
        setAiError(msg);
        setAiLoadingState('error');
        addToast('AI generation failed. You can retry from the loading screen.', 'error');
      }
    };

    loadPipeline();

    return () => {
      mounted = false;
      // Reset guard if the effect re-runs due to retryTrigger changing
      pipelineStarted.current = false;
    };
  // STABLE dep array — always exactly 3 items, never changes size:
  // - profile/destination: re-run if trip context changes
  // - retryTrigger: increments on retry, allowing the pipeline to re-fire
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, destination, retryTrigger]);

  if (!destination) return null;

  return (
    <div className="flex gap-6 pb-32 relative">
      <AILoadingOverlay />

      <div className="flex-1 space-y-12 max-w-5xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Discover {destination.city}</h2>
          <p className="text-text-secondary">We've tailored these suggestions just for you.</p>
        </div>

        <MoodExplorer />
        <NeighborhoodsCard />

        <RecommendationsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <HiddenGemsPanel onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <HeritageInsights />
        <ExperiencesGrid onOpenStory={(id, name) => setActiveStory({ id, name })} />
        <EventsCalendar onOpenStory={(id, name) => setActiveStory({ id, name })} />
      </div>

      {/* Desktop Trip Summary Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-8">
          <TripSummarySidebar />
        </div>
      </div>

      {activeStory && (
        <StorytellingModal
          placeId={activeStory.id}
          placeName={activeStory.name}
          onClose={() => setActiveStory(null)}
        />
      )}

      {/* Mobile Sticky Selection Tray */}
      <div className="lg:hidden">
        <SelectionTray />
      </div>
    </div>
  );
};
