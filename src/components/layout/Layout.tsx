import React from 'react';
import { Header } from './Header';
import { ErrorBoundary } from './ErrorBoundary';
import { Compass } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-color text-text-color font-sans flex flex-col selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-900 dark:selection:text-primary-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer className="border-t border-border-color bg-surface-color/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Compass size={14} className="text-primary-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">TravelYarro</span>
            <span>— AI Travel Companion</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} · India travel · Prices in ₹ INR
          </p>
        </div>
      </footer>
    </div>
  );
};

