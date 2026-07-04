import React from 'react';
import { Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <Compass className="w-12 h-12 text-gray-400 dark:text-gray-500" />,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-color dark:bg-surface-color border border-border-color rounded-xl shadow-sm">
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
