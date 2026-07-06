import React from 'react';
import { Plus, Check, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { SelectedItem } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { resolvePlaceImage } from '../../utils/imageResolver';

interface PlaceCardProps {
  id: string;
  type: SelectedItem['type'];
  name: string;
  description: string;
  estCost?: number;
  tags?: string[];
  location?: string;
  onClick?: () => void;
  category?: string; // Optional category mapping for images
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  id, type, name, description, estCost, tags, location, onClick, category
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

  const imageUrl = resolvePlaceImage(name, category || type, type);

  return (
    <div 
      className="flex flex-col h-full bg-surface-color dark:bg-gray-800 rounded-2xl border border-border-color overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Visual Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
        
        {/* Toggle Button Overlaid */}
        <button 
          onClick={handleToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all backdrop-blur-md shadow-md
            ${isSelected 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-800'
            }`}
        >
          {isSelected ? <Check size={14} className="stroke-[3]" /> : <Plus size={14} className="stroke-[3]" />}
        </button>

        {/* Type Badge Overlaid */}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-black/40 text-white backdrop-blur-md rounded-md border border-white/10">
          {type === 'recommendation' ? (category || 'explore') : type}
        </span>
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-1">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">{description}</p>
        </div>
        
        <div className="space-y-3">
          {location && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin size={12} className="mr-1.5 text-primary-500" /> 
              <span className="truncate">{location}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-border-color/50 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 border border-border-color rounded text-gray-600 dark:text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
            {estCost !== undefined && (
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(estCost, 'INR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
