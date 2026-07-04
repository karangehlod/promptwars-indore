import { useState, useMemo } from 'react';

export function useFilteredList<T>(
  items: T[], 
  searchKey: keyof T,
  categoryKey?: keyof T
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = String(item[searchKey])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || 
        (categoryKey && String(item[categoryKey]) === selectedCategory);
        
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory, searchKey, categoryKey]);

  const categories = useMemo(() => {
    if (!categoryKey) return ['All'];
    const unique = new Set(items.map(item => String(item[categoryKey])));
    return ['All', ...Array.from(unique)];
  }, [items, categoryKey]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    categories
  };
}
