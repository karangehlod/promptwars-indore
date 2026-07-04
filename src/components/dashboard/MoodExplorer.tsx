import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Compass, Sparkles, Flame, Eye, Landmark } from 'lucide-react';

export const MOODS = [
  { id: 'Culture', label: 'Culture & Arts', icon: Compass, color: 'from-orange-500 to-amber-500' },
  { id: 'Culinary', label: 'Foodie / Culinary', icon: Flame, iconChar: '🌶️', color: 'from-red-500 to-orange-500' },
  { id: 'Adventure', label: 'Adventure & Thrill', icon: Sparkles, iconChar: '🧗', color: 'from-blue-500 to-indigo-500' },
  { id: 'Nature', label: 'Nature & Relax', icon: Eye, iconChar: '🌿', color: 'from-emerald-500 to-teal-500' },
  { id: 'Historical', label: 'History & Secrets', icon: Landmark, color: 'from-bronze-500 to-amber-800' },
];

export const MoodExplorer: React.FC = () => {
  const activeMood = useAppStore(s => s.activeMood);
  const setActiveMood = useAppStore(s => s.setActiveMood);

  return (
    <div className="bg-surface-color/50 dark:bg-gray-900/50 backdrop-blur-md rounded-3xl p-6 border border-border-color shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-primary-500" />
        <h3 className="font-bold text-lg">What's your travel mood today?</h3>
      </div>
      <p className="text-sm text-text-secondary">
        Filter suggestions and discover top neighborhoods matching your vibe.
      </p>
      
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveMood(null)}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border
            ${activeMood === null
              ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20'
              : 'bg-white dark:bg-gray-800 text-text-secondary border-border-color hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          🌐 Show All
        </button>

        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => setActiveMood(mood.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border
                ${isActive
                  ? `bg-gradient-to-r ${mood.color} text-white border-transparent shadow-md`
                  : 'bg-white dark:bg-gray-800 text-text-secondary border-border-color hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {mood.iconChar ? (
                <span className="text-base leading-none">{mood.iconChar}</span>
              ) : (
                <Icon size={16} className={isActive ? 'text-white' : 'text-text-secondary'} />
              )}
              {mood.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
