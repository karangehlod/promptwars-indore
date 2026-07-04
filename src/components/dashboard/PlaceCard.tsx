import React from 'react';
import { Plus, Check, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { SelectedItem } from '../../store/useAppStore';

interface PlaceCardProps {
  id: string;
  type: SelectedItem['type'];
  name: string;
  description: string;
  estCost?: number;
  tags?: string[];
  location?: string;
  onClick?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  id, type, name, description, estCost, tags, location, onClick
}) => {
  const { selections, addSelection, removeSelection } = useAppStore();
  const isSelected = selections.some(s => s.id === id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      removeSelection(id);
    } else {
      addSelection({ id, type, name, estCost });
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-surface-color dark:bg-gray-800 rounded-xl border border-border-color overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{name}</h3>
          <button 
            onClick={handleToggle}
            className={`p-1.5 rounded-full transition-colors ${isSelected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}`}
          >
            {isSelected ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">{description}</p>
        
        {location && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <MapPin size={12} className="mr-1" /> {location}
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-border-color flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-border-color rounded-md text-gray-600 dark:text-gray-300">
              {tag}
            </span>
          ))}
        </div>
        {estCost !== undefined && (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${estCost}
          </span>
        )}
      </div>
    </div>
  );
};
