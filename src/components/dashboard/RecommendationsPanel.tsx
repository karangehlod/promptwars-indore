import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/Card';
import { StaggeredGrid } from '../ui/StaggeredGrid';
import { useFilteredList } from '../../hooks/useFilteredList';
import { MapPin, ArrowRight, Search, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

import { matchMood } from '../../utils/moodFilter';
import { resolvePlaceImage } from '../../utils/imageResolver';

export const RecommendationsPanel: React.FC<{ onOpenStory: (id: string, name: string) => void }> = ({ onOpenStory }) => {
  const { recommendations, selections, addSelection, removeSelection, activeMood } = useAppStore();
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Apply mood filtering first
  const moodFilteredRecommendations = recommendations.filter(rec => matchMood(rec, activeMood));

  const {
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    filteredItems, categories
  } = useFilteredList(moodFilteredRecommendations, 'name', 'category');

  if (!recommendations.length) return null;

  const handleSelect = (rec: any) => {
    if (compareMode) {
      if (compareIds.includes(rec.id)) {
        setCompareIds(prev => prev.filter(id => id !== rec.id));
      } else if (compareIds.length < 2) {
        setCompareIds(prev => [...prev, rec.id]);
      }
      return;
    }

    const isSelected = selections.some(s => s.id === rec.id);
    if (isSelected) {
      removeSelection(rec.id);
    } else {
      addSelection({
        id: rec.id,
        type: 'recommendation',
        name: rec.name,
        estCost: rec.estCost
      });
    }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-accent" /> Recommended for you
        </h3>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-1 focus:ring-accent outline-none"
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="py-2 pl-3 pr-8 bg-surface border border-border rounded-lg text-sm outline-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareIds([]);
            }}
            className={`p-2 rounded-lg border transition-colors ${compareMode ? 'bg-accent text-white border-accent' : 'bg-surface border-border text-text-secondary hover:text-text-primary'}`}
            title="Compare Mode"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {compareMode && compareIds.length === 2 && (
        <div className="mb-6 p-4 bg-surface-elevated rounded-xl border border-border grid grid-cols-2 gap-4">
          {compareIds.map(id => {
            const item = recommendations.find(r => r.id === id)!;
            return (
              <div key={'comp-'+id} className="p-4 bg-surface rounded-lg border shadow-sm">
                <h4 className="font-bold mb-2">{item.name}</h4>
                <p className="text-sm text-text-secondary mb-3">{item.description}</p>
                <div className="flex justify-between text-sm font-medium">
                  <span>{formatCurrency(item.estCost, 'INR')}</span>
                  <span className="text-accent">{item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-10 bg-surface rounded-2xl border border-border text-text-secondary">
          No places found matching the filters or active vibe. Try selecting another mood above!
        </div>
      ) : (
        <StaggeredGrid dataFetchId={recommendations.length}>
        {filteredItems.map((rec) => {
          const isSelected = selections.some(s => s.id === rec.id);
          const isComparing = compareIds.includes(rec.id);
          
          return (
            <Card 
              key={rec.id}
              selected={compareMode ? isComparing : isSelected}
              onSelect={() => handleSelect(rec)}
              className="overflow-hidden p-0 flex flex-col h-full group"
            >
              {/* Card Image Header */}
              <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={resolvePlaceImage(rec.name, rec.category, 'recommendation')} 
                  alt={rec.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                
                {/* Overlaid Category Badge */}
                <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-black/40 text-white backdrop-blur-md rounded-md border border-white/10">
                  {rec.category}
                </span>

                {/* Overlaid Cost */}
                <span className="absolute bottom-3 right-3 text-xs font-bold text-white px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md">
                  {formatCurrency(rec.estCost, 'INR')}
                </span>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">{rec.name}</h4>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {rec.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {!compareMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStory(rec.id, rec.name);
                  }}
                  className="mt-auto flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Read the story <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
              </div>
            </Card>
          );
        })}
      </StaggeredGrid>
      )}
    </section>
  );
};
