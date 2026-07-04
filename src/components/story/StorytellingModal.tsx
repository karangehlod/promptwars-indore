import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateStoryStream } from '../../services/agent';
import { StreamingText } from './StreamingText';

interface StorytellingModalProps {
  placeId: string;
  placeName: string;
  onClose: () => void;
}

const THEMES = ['Folklore & Legends', 'History & Secrets', 'Adventure & Thrills', 'Culinary Journey'];

export const StorytellingModal: React.FC<StorytellingModalProps> = ({ placeId, placeName, onClose }) => {
  const { profile } = useAppStore();
  const [theme, setTheme] = useState(THEMES[0]);
  const [storyText, setStoryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const startGeneration = useCallback((selectedTheme: string) => {
    if (!profile) return;
    
    // Abort previous generation if any (though typically API takes a signal, here we'll just ignore chunks)
    setIsGenerating(true);
    setError('');
    setStoryText('');
    
    // We simulate cancellation by a simple flag for this client implementation
    let isCancelled = false;
    abortControllerRef.current = new AbortController();

    generateStoryStream(placeName, selectedTheme, profile, (chunk) => {
      if (isCancelled) return;
      if (chunk.includes('[Error')) {
        setError('Failed to generate story.');
        setIsGenerating(false);
      } else {
        setStoryText(prev => prev + chunk);
      }
    }).then(() => {
      if (!isCancelled) setIsGenerating(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [profile, placeName]);

  useEffect(() => {
    const cleanup = startGeneration(theme);
    return cleanup;
  }, [placeId, placeName, profile, theme, startGeneration]);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-color dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-border-color">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary-500" size={20} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{placeName}</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="p-4 sm:px-6 flex gap-2 overflow-x-auto border-b border-border-color bg-white dark:bg-gray-900">
          {THEMES.map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              disabled={isGenerating}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50
                ${theme === t 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow relative min-h-[300px]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <AlertCircle className="w-12 h-12 mb-2" />
              <p>{error}</p>
              <button 
                onClick={() => startGeneration(theme)}
                className="mt-4 px-4 py-2 border border-red-500 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {storyText && <StreamingText text={storyText} />}
              {isGenerating && (
                <div className="mt-4 flex items-center text-primary-500 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse mr-1"></span>
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-75 mr-1"></span>
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-150"></span>
                  <span className="ml-2 italic">Crafting narrative...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
