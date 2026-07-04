import React from 'react';
import { Header } from './Header';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-color text-text-color font-sans flex flex-col selection:bg-primary-200 selection:text-primary-900 dark:selection:bg-primary-900 dark:selection:text-primary-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-border-color">
        <p>© {new Date().getFullYear()} TravelYarro AI Travel Companion</p>
      </footer>
    </div>
  );
};
