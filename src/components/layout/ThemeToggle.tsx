import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-surface-color dark:bg-surface-color border border-border-color rounded-full p-1 shadow-sm">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
};
