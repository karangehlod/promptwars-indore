import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const DestinationInput: React.FC = () => {
  const { profile, setDestination, setActiveStep } = useAppStore();
  
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const country = 'India';
    if (!city || !region || !startDate || !endDate) {
      setError('Please fill in city, state, and dates.');
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

    // We can transition immediately and let dashboard handle loading states
    setIsSubmitting(false);
    setActiveStep('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface-color dark:bg-surface-color p-6 md:p-8 rounded-2xl shadow-sm border border-border-color mt-8">
      <h2 className="text-2xl font-bold mb-2">Where in India to next?</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Tell us your destination and confirm your dates.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input 
                type="text"
                placeholder="e.g. Jaipur"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State / Union Territory</label>
              <select 
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-border-color rounded-md bg-surface-color dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-500">Country</label>
              <input 
                type="text"
                value="India"
                disabled
                className="w-full px-3 py-2 border border-border-color rounded-md bg-gray-100 text-gray-500 dark:bg-gray-700/50 cursor-not-allowed"
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
