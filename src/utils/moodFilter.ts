export const matchMood = (
  item: { name: string; category?: string; description?: string; tags?: string[]; type?: string },
  mood: string | null
): boolean => {
  if (!mood) return true;
  const query = mood.toLowerCase();
  
  // Combine all textual fields of the item to search keywords
  const text = [
    item.name,
    item.category || '',
    item.type || '',
    item.description || '',
    ...(item.tags || [])
  ].join(' ').toLowerCase();

  const keywords: Record<string, string[]> = {
    culture: ['culture', 'heritage', 'art', 'museum', 'monument', 'temple', 'spiritual', 'music', 'dance', 'fest', 'drama', 'theatre', 'handicraft', 'craft'],
    culinary: ['food', 'culinary', 'taste', 'dine', 'restaurant', 'street', 'sweet', 'flavor', 'cafe', 'eat', 'bazar', 'bazaar', 'snack', 'drink', 'beverage', 'local dish', 'spice', 'cook', 'cooking'],
    adventure: ['adventure', 'thrill', 'trek', 'hike', 'wildlife', 'safari', 'camp', 'climb', 'waterfall', 'outdoor', 'ride', 'sport', 'cave', 'explore', 'thrilling'],
    nature: ['nature', 'relax', 'lake', 'garden', 'park', 'sunset', 'quiet', 'peace', 'view', 'scenic', 'green', 'valley', 'river', 'forest', 'sanctuary', 'peaceful'],
    historical: ['history', 'ancient', 'secret', 'palace', 'fort', 'historical', 'museum', 'ruin', 'king', 'dynasty', 'queen', 'heritage', 'archaeology', 'tomb', 'old']
  };

  const list = keywords[query];
  if (!list) return true;
  return list.some(k => text.includes(k));
};
