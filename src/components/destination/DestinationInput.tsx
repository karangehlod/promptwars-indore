import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getRecommendations, getHiddenGems, getHeritageInsights, getLocalEvents, getAuthenticExperiences } from '../../services/agent';

export const DestinationInput: React.FC = () => {
  const { profile, setDestination, setActiveStep, setRecommendations, setHiddenGems, setHeritage, setEvents, setExperiences } = useAppStore();
  
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState(profile?.dates.start || '');
  const [endDate, setEndDate] = useState(profile?.dates.end || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !country || !startDate || !endDate) {
      setError('Please fill in city, country, and dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date.');
      return;
    }

    if (!profile) {
      setError('Profile not found. Please complete step 1.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const dest = { city, region, country };
    setDestination(dest);

    // Fire all 5 parallel calls
    // We update store immediately as they resolve to avoid blocking
    Promise.allSettled([
      getRecommendations(profile, dest).then(res => res.success && setRecommendations(res.data)),
      getHiddenGems(profile, dest).then(res => res.success && setHiddenGems(res.data)),
      getHeritageInsights(dest).then(res => res.success && setHeritage(res.data)),
      getLocalEvents(dest, { start: startDate, end: endDate }).then(res => res.success && setEvents(res.data)),
      getAuthenticExperiences(profile, dest).then(res => res.success && setExperiences(res.data))
    ]).finally(() => {
      setIsSubmitting(false);
      setActiveStep('dashboard');
    });
    
    // We can transition immediately and let dashboard handle loading states, but the prompt says 
    // "DashboardGrid renders 5 panels each independently wired to useAsyncAction(agentFn) -> loading skeleton"
    // Wait, if I trigger them here, they resolve in store.
    // Ah, the prompt says: "DestinationInput... On submit: fire all 5 FAST_MODEL calls via Promise.allSettled"
    // AND "DashboardGrid renders 5 panels each independently wired to useAsyncAction(agentFn)"
    // If panels are independently wired, they should probably do the fetching themselves using useAsyncAction.
    // Let me just set the destination and activeStep here, and let the dashboard panels use useAsyncAction!
    // But the prompt says "On submit: fire all 5 FAST_MODEL calls via Promise.allSettled". 
    // I'll fire them here, but not await them. Then navigate to dashboard. Dashboard can just read the store, or I can structure Dashboard to do the fetching.
    // Let's stick to Dashboard panels doing the fetching for better isolated loading states via useAsyncAction!
    setIsSubmitting(false);
    setActiveStep('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface-color dark:bg-surface-color p-6 md:p-8 rounded-2xl shadow-sm border border-border-color mt-8">
      <h2 className="text-2xl font-bold mb-2">Where to next?</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Tell us your destination and confirm your dates.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input 
                type="text"
                placeholder="e.g. Kyoto"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region/State (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Kansai"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Country</label>
              <input 
                type="text"
                placeholder="e.g. Japan"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input 
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Loading Dashboard...' : 'Explore Destination'}
        </button>
      </form>
    </div>
  );
};
