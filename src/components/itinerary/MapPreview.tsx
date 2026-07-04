import React from 'react';
import { Map } from 'lucide-react';

export const MapPreview: React.FC<{ destinationName: string }> = ({ destinationName }) => {
  return (
    <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-border-color overflow-hidden relative flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
      <Map size={32} className="mb-2 opacity-50" />
      <span className="text-sm font-medium">Map of {destinationName}</span>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};
