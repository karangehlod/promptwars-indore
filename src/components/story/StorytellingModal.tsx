import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { agent } from '../../services/AgentFacade';
import { StreamingText } from './StreamingText';
import { Logger } from '../../utils/logger';
import { ReelsStrip } from '../ui/ReelsStrip';

interface StorytellingModalProps {
  placeId: string;
  placeName: string;
  onClose: () => void;
}

const THEMES = ['Folklore & Legends', 'History & Secrets', 'Adventure & Thrills', 'Culinary Journey'];

// Stable cache key: placeId + theme
function storyCacheKey(placeId: string, theme: string) {
  return `${placeId}::${theme}`;
}

export const StorytellingModal: React.FC<StorytellingModalProps> = ({ placeId, placeName, onClose }) => {
  const profile = useAppStore(s => s.profile);
  const destination = useAppStore(s => s.destination);
  const city = destination?.city ?? '';
  // stories in store: Record<cacheKey, text>
  const stories = useAppStore(s => s.stories);
  const setStory = useAppStore(s => s.setStory);

  const [theme, setTheme] = useState(THEMES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [localText, setLocalText] = useState(''); // streaming buffer for this session
  const cancelledRef = useRef(false);

  const cacheKey = storyCacheKey(placeId, theme);
  const cachedStory = stories[cacheKey];

  const generateStory = useCallback(async (selectedTheme: string) => {
    if (!profile) return;

    const key = storyCacheKey(placeId, selectedTheme);
    // Cache hit — no API call
    if (stories[key]) {
      Logger.store(`Story cache hit: ${key}`);
      setLocalText(stories[key]);
      return;
    }

    cancelledRef.current = false;
    setIsGenerating(true);
    setError('');
    setLocalText('');

    try {
      let accumulated = '';
      await agent.stories.generateStoryStream(placeName, selectedTheme, profile, (chunk) => {
        if (cancelledRef.current) return;
        accumulated += chunk;
        setLocalText(accumulated);
      });

      if (!cancelledRef.current) {
        // Persist to store so switching back to this theme is instant
        setStory(key, accumulated);
        setIsGenerating(false);
        Logger.ai(`Story generated and cached: ${key} (${accumulated.length} chars)`);
      }
    } catch (err: any) {
      if (cancelledRef.current) return;
      const msg = err?.message?.includes('429')
        ? 'API quota reached. Please wait a moment and try again.'
        : (err?.message || 'Failed to generate story. Please retry.');
      Logger.error(`Story generation failed (${key}): ${msg}`);
      setError(msg);
      setIsGenerating(false);
    }
  }, [profile, placeId, placeName, stories, setStory]);

  // Fire on mount and on theme change — but only if not cached
  useEffect(() => {
    cancelledRef.current = false;

    if (cachedStory) {
      setLocalText(cachedStory);
      setError('');
      setIsGenerating(false);
    } else {
      generateStory(theme);
    }

    return () => {
      cancelledRef.current = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, theme]); // Only re-fire when place or theme changes

  const displayText = cachedStory || localText;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-color dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border-color">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary-500" size={20} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{placeName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="p-4 sm:px-6 flex gap-2 overflow-x-auto border-b border-border-color bg-white dark:bg-gray-900 shrink-0">
          {THEMES.map(t => {
            const key = storyCacheKey(placeId, t);
            const isCached = !!stories[key];
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                disabled={isGenerating && theme !== t}
                title={isCached ? 'Cached ✓' : ''}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-40 relative
                  ${theme === t
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
              >
                {t}
                {isCached && theme !== t && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" title="Cached" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow relative min-h-[300px]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm max-w-sm">{error}</p>
              <button
                onClick={() => generateStory(theme)}
                className="flex items-center gap-2 mt-2 px-4 py-2 border border-red-400 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : (
            <>
              {displayText && <StreamingText text={displayText} />}
              {isGenerating && (
                <div className="mt-4 flex items-center text-primary-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse mr-1" />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-75 mr-1" />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-150" />
                  <span className="ml-2 italic text-gray-500 dark:text-gray-400">
                    {displayText ? 'Finishing story...' : 'Crafting narrative...'}
                  </span>
                </div>
              )}
              {!displayText && !isGenerating && !error && (
                <div className="text-center text-gray-400 mt-10">No content yet.</div>
              )}
            </>
          )}

          {/* YouTube Reels Strip */}
          <ReelsStrip placeName={placeName} city={city} />
        </div>
      </div>
    </div>
  );
};
