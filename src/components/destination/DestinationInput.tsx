import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Logger } from '../../utils/logger';
import { agent } from '../../services/AgentFacade';
import { Loader2, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { LocationValidation } from '../../schemas/location';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const COUNTRY = 'India';

type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'uncertain';

export const DestinationInput: React.FC = () => {
  const profile = useAppStore(s => s.profile);
  const setDestination = useAppStore(s => s.setDestination);
  const setActiveStep = useAppStore(s => s.setActiveStep);
  const validatedLocations = useAppStore(s => s.validatedLocations);
  const cacheValidatedLocation = useAppStore(s => s.cacheValidatedLocation);

  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation state
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationResult, setValidationResult] = useState<LocationValidation | null>(null);

  const cacheKey = `${COUNTRY}|${region}|${city.trim().toLowerCase()}`;
  const isCached = city.trim() && region && cacheKey in validatedLocations;
  const isLocationValid = isCached ? validatedLocations[cacheKey] : validationStatus === 'valid';

  const dates = profile?.dates;

  const handleValidate = async () => {
    if (!city.trim() || !region) {
      setError('Please select a state and enter a city.');
      return;
    }
    if (!profile) {
      setError('Profile not found. Please complete step 1.');
      return;
    }

    // Cache hit — skip AI call
    if (isCached) {
      if (validatedLocations[cacheKey]) {
        Logger.store('Location validation cache hit (valid)');
        handleProceed();
      } else {
        setValidationStatus('invalid');
        setError(`'${city}' in ${region} was previously marked as invalid.`);
      }
      return;
    }

    setError('');
    setValidationStatus('checking');
    setValidationResult(null);

    try {
      const result = await agent.location.validate(COUNTRY, region, city.trim());
      setValidationResult(result);
      Logger.ai(`Location validation: ${JSON.stringify(result)}`);

      if (result.valid && result.confidence === 'high') {
        cacheValidatedLocation(cacheKey, true);
        setValidationStatus('valid');
      } else if (result.valid && result.confidence !== 'high') {
        setValidationStatus('uncertain');
      } else {
        cacheValidatedLocation(cacheKey, false);
        setValidationStatus('invalid');
      }
    } catch (err: any) {
      Logger.error('Location validation failed: ' + err.message);
      // On validation service failure, allow proceed with a warning (fail-open)
      setValidationStatus('valid');
    }
  };

  const handleProceed = () => {
    if (!profile) return;
    setIsSubmitting(true);
    const resolvedCity = validationResult?.correctedCity || city.trim();
    const resolvedRegion = validationResult?.correctedState || region;
    Logger.input(`Destination confirmed: ${resolvedCity}, ${resolvedRegion}`);
    setDestination({ city: resolvedCity, region: resolvedRegion, country: COUNTRY });
    setActiveStep('dashboard');
  };

  const handleApplyCorrection = () => {
    if (validationResult?.correctedCity) setCity(validationResult.correctedCity);
    if (validationResult?.correctedState) setRegion(validationResult.correctedState);
    setValidationStatus('idle');
    setValidationResult(null);
    setError('');
  };

  const handleCityOrStateChange = () => {
    // Reset validation when user changes input
    setValidationStatus('idle');
    setValidationResult(null);
    setError('');
  };

  const fieldClass = "w-full px-3 py-2.5 border rounded-lg bg-surface-color dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors";
  const borderClass = {
    idle: 'border-border-color',
    checking: 'border-blue-400',
    valid: 'border-green-500',
    invalid: 'border-red-400',
    uncertain: 'border-amber-400',
  }[validationStatus];

  return (
    <div className="max-w-2xl mx-auto bg-surface-color dark:bg-surface-color p-6 md:p-8 rounded-2xl shadow-sm border border-border-color mt-8">
      <h2 className="text-2xl font-bold mb-1">Where in India to next?</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Select your destination — your trip dates from profile ({dates ? `${dates.start} → ${dates.end}` : 'not set'}) will be used throughout.
      </p>

      {!dates && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Trip dates not set. Please go back to Profile → Dates step to set them.
        </div>
      )}

      <div className="space-y-4">
        {/* State dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">State / Union Territory</label>
          <select
            value={region}
            onChange={e => { setRegion(e.target.value); handleCityOrStateChange(); }}
            className={`${fieldClass} border-border-color`}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* City input + validation */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <div className="relative">
            <input
              type="text"
              placeholder={region ? `e.g. city in ${region}` : 'Select a state first'}
              value={city}
              disabled={!region}
              onChange={e => { setCity(e.target.value); handleCityOrStateChange(); }}
              className={`${fieldClass} ${borderClass} pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationStatus === 'checking' && <Loader2 size={16} className="animate-spin text-blue-500" />}
              {validationStatus === 'valid' && <CheckCircle size={16} className="text-green-500" />}
              {validationStatus === 'invalid' && <XCircle size={16} className="text-red-400" />}
              {validationStatus === 'uncertain' && <AlertTriangle size={16} className="text-amber-400" />}
              {validationStatus === 'idle' && city && <MapPin size={16} className="text-gray-400" />}
            </div>
          </div>

          {/* Inline status message */}
          {validationStatus === 'checking' && (
            <p className="text-xs text-blue-500 mt-1">Checking location…</p>
          )}
          {validationStatus === 'valid' && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Location confirmed: {validationResult?.correctedCity || city}, {region}</p>
          )}
          {validationStatus === 'invalid' && (
            <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                We couldn't confirm '{city}' is in {region}, {COUNTRY}.
                {validationResult?.reason && ` ${validationResult.reason}`}
              </p>
              {(validationResult?.correctedCity || validationResult?.correctedState) && (
                <button
                  onClick={handleApplyCorrection}
                  className="mt-1.5 text-xs px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors font-medium"
                >
                  Did you mean {validationResult.correctedCity || city}, {validationResult.correctedState || region}?
                </button>
              )}
            </div>
          )}
          {validationStatus === 'uncertain' && (
            <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Location found but confidence is low. Please double-check the spelling.
                {validationResult?.reason && ` ${validationResult.reason}`}
              </p>
              {(validationResult?.correctedCity || validationResult?.correctedState) && (
                <button
                  onClick={handleApplyCorrection}
                  className="mt-1.5 text-xs px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200 rounded hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors font-medium"
                >
                  Did you mean {validationResult.correctedCity || city}?
                </button>
              )}
            </div>
          )}
        </div>

        {/* Country — fixed, non-editable */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">Country</label>
          <input
            type="text"
            value={COUNTRY}
            disabled
            className="w-full px-3 py-2.5 border border-border-color rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700/50 cursor-not-allowed"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          {/* Step 1: Validate button — always shown when location not yet valid */}
          {!isLocationValid && (
            <button
              type="button"
              onClick={handleValidate}
              disabled={!city.trim() || !region || validationStatus === 'checking' || !dates}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {validationStatus === 'checking'
                ? <><Loader2 size={16} className="animate-spin" /> Checking location…</>
                : <><MapPin size={16} /> Verify Location</>
              }
            </button>
          )}

          {/* Step 2: Proceed — only enabled after valid or cached validation */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={!isLocationValid || isSubmitting || !dates}
            className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Opening Dashboard…' : 'Explore Destination →'}
          </button>
        </div>
      </div>
    </div>
  );
};
