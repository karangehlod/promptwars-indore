/**
 * Maps place names, categories, and types to curated, high-quality Unsplash travel photos.
 * Focuses on premium aesthetics, vibrant colors, and representative landmarks.
 */

const CATEGORY_IMAGES: Record<string, string> = {
  culture: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=600', // Taj/Spiritual/Palace
  arts: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600', // Painting/Arts
  culinary: 'https://images.unsplash.com/photo-1596422846543-c5c6ff18e05e?auto=format&fit=crop&q=80&w=600', // Indian street food
  foodie: 'https://images.unsplash.com/photo-1596422846543-c5c6ff18e05e?auto=format&fit=crop&q=80&w=600',
  food: 'https://images.unsplash.com/photo-1596422846543-c5c6ff18e05e?auto=format&fit=crop&q=80&w=600',
  adventure: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600', // Mountain hike/trek
  thrill: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=600', // Waterfall/Adventure
  nature: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600', // Forest/Relax
  relax: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600', // Yoga/Quiet nature
  historical: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600', // Ancient Fort/Palace
  history: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600',
  shopping: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&q=80&w=600', // Bazaar/Market
  landmark: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=600', // Landmark/India Gate
  workshop: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600', // Coffee/Pottery workshop
  homestay: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600', // Premium villa/stay
  guide: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=600', // Tour guide/map
};

const SPECIFIC_PLACE_IMAGES: Record<string, string> = {
  'patalpani waterfall': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600',
  'ralamandal wildlife sanctuary': 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=600',
  'chappan dukan': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
  'sarafa bazar': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600',
  'rajwada palace': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600',
  'lal bagh palace': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
  'elphinstone': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
};

export function resolvePlaceImage(name: string, category?: string, type?: string): string {
  const normName = name.toLowerCase().trim();
  
  // 1. Direct match on place name
  for (const [key, url] of Object.entries(SPECIFIC_PLACE_IMAGES)) {
    if (normName.includes(key)) {
      return url;
    }
  }

  // 2. Category matching
  if (category) {
    const normCategory = category.toLowerCase().trim();
    if (CATEGORY_IMAGES[normCategory]) {
      return CATEGORY_IMAGES[normCategory];
    }
  }

  // 3. Type matching (e.g., homestay, workshop, guide)
  if (type) {
    const normType = type.toLowerCase().trim();
    if (CATEGORY_IMAGES[normType]) {
      return CATEGORY_IMAGES[normType];
    }
  }

  // 4. Keyword search within name
  const keywords = ['food', 'eat', 'bazar', 'bazaar', 'restaurant', 'cafe', 'taste', 'sweet', 'dish'];
  if (keywords.some(kw => normName.includes(kw))) {
    return CATEGORY_IMAGES.culinary;
  }
  
  const natureKeywords = ['waterfall', 'lake', 'garden', 'park', 'sanctuary', 'hill', 'forest', 'valley', 'nature'];
  if (natureKeywords.some(kw => normName.includes(kw))) {
    return CATEGORY_IMAGES.nature;
  }

  const historicalKeywords = ['palace', 'fort', 'heritage', 'temple', 'museum', 'tomb', 'ruins', 'monument', 'history'];
  if (historicalKeywords.some(kw => normName.includes(kw))) {
    return CATEGORY_IMAGES.historical;
  }

  // 5. Ultimate generic beautiful travel fallback
  return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600';
}
