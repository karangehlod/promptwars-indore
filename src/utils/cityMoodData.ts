export interface NeighborhoodInfo {
  name: string;
  description: string;
  highlights: string[];
}

export const CITY_MOOD_NEIGHBORHOODS: Record<string, Record<string, NeighborhoodInfo[]>> = {
  indore: {
    Culture: [
      { name: 'Rajwada Palace & Sarafa', description: 'The historical heart of Indore, blending Maratha and Mughal architecture, transitioning into Sarafa heritage night market.', highlights: ['Rajwada Front facade', 'Krishnapura Chhatris', 'Sarafa street art'] }
    ],
    Culinary: [
      { name: 'Chappan Dukan (56 Shops)', description: 'Indore\'s ultimate street-food hub offering Johnny Hot Dog, indori poha, sharafat chaat, and local sweets.', highlights: ['Johnny Hot Dog', 'Poha Jalebi', 'Coconut Crush'] },
      { name: 'Sarafa Bazar (Night Market)', description: 'A bustling jewelry market by day that transforms into a legendary street food market by night.', highlights: ['Dahi Vada', 'Garadu (spicy yam)', 'Rabdi Malpua'] }
    ],
    Adventure: [
      { name: 'Patalpani & Ralamandal', description: 'Scenic valley lookouts, hiking paths, and wildlife sanctuaries on the outskirts of Indore.', highlights: ['Ralamandal trekking', 'Patalpani waterfall trail', 'Flora and fauna spotting'] }
    ],
    Nature: [
      { name: 'Pipliyapala Regional Park', description: 'Lush gardens, boating lakes, and musical fountains perfect for a relaxing evening walk.', highlights: ['Boating canal', 'French-style gardens', 'Musical fountain show'] }
    ],
    Historical: [
      { name: 'Lal Bagh Palace Area', description: 'European-styled palace showcasing the grand lifestyle of the Holkar dynasty with massive gardens.', highlights: ['Palace museum gates', 'Holkar family relics', 'Verona marble halls'] }
    ]
  },
  mumbai: {
    Culture: [
      { name: 'Kala Ghoda Art District', description: 'Mumbai\'s premier art district filled with galleries, heritage buildings, and chic cafes.', highlights: ['Jehangir Art Gallery', 'National Gallery of Modern Art', 'Street boutiques'] }
    ],
    Culinary: [
      { name: 'Khau Gallis of South Mumbai', description: 'Bustling food alleys serving legendary pav bhaji, rolls, sandwich grills, and cutting chai.', highlights: ['Carter Road eats', 'Ghatkopar Khau Galli', 'Mohammed Ali Road non-veg delicacies'] }
    ],
    Adventure: [
      { name: 'Sanjay Gandhi National Park', description: 'Massive forest reserve inside the city containing ancient Kanheri Caves and cycling trails.', highlights: ['Kanheri Cave exploration', 'Bicycle renting', 'Tiger safari'] }
    ],
    Nature: [
      { name: 'Marine Drive & Chowpatty', description: 'A long promenade along the Arabian Sea, perfect for sunsets and cool sea breezes.', highlights: ['Sunset walks', 'Chowpatty bhel puri', 'Queen\'s Necklace lights'] }
    ],
    Historical: [
      { name: 'Colaba & Fort Area', description: 'Victorian Gothic and Art Deco buildings from the British colonial era.', highlights: ['Gateway of India', 'Taj Mahal Palace', 'Chhatrapati Shivaji Terminus'] }
    ]
  },
  delhi: {
    Culture: [
      { name: 'Dilli Haat (INA)', description: 'An open-air food plaza and craft bazaar showcasing ethnic wares and culinary delights from every Indian state.', highlights: ['State food stalls', 'Handicraft shopping', 'Cultural performances'] }
    ],
    Culinary: [
      { name: 'Chandni Chowk', description: 'The absolute food capital of Old Delhi. Home to Paranthe Wali Gali, spice markets, and centuries-old eateries.', highlights: ['Paranthe Wali Gali', 'Jalebi Wala', 'Natraj Dahi Bhalla'] }
    ],
    Adventure: [
      { name: 'Asola Bhatti Wildlife Sanctuary', description: 'Rugged trails and hidden blue lakes on the Southern Delhi ridge.', highlights: ['Cycling trails', 'Bird watching', 'Neeli Hauz lake view'] }
    ],
    Nature: [
      { name: 'Lodi Gardens', description: 'Beautifully landscaped park containing 15th-century tombs, popular for jogging and picnics.', highlights: ['Bara Gumbad tomb', 'Lodi era architecture', 'Quiet walking paths'] }
    ],
    Historical: [
      { name: 'Old Delhi & Red Fort Area', description: 'The core of Mughal India, filled with colossal monuments and bustling traditional markets.', highlights: ['Red Fort (Lal Qila)', 'Jama Masjid', 'Fatehpuri Mosque'] }
    ]
  }
};

export function getNeighborhoodSuggestions(city: string, mood: string): NeighborhoodInfo[] {
  const normCity = city.toLowerCase().trim();
  const cityData = CITY_MOOD_NEIGHBORHOODS[normCity];
  if (cityData && cityData[mood]) {
    return cityData[mood];
  }

  // General fallback mapping if the city is not in the database
  return [
    {
      name: `${city} City Center / Local Market`,
      description: `Ideal area in ${city} to experience the local culture, interact with residents, and sample authentic regional specialties matching your ${mood} mood.`,
      highlights: ['Local landmarks', 'Regional street food stalls', 'Souvenir shops']
    }
  ];
}
