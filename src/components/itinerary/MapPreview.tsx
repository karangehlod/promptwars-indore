import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Destination } from '../../schemas/destination';
import type { DayPlan } from '../../schemas/itinerary';

interface MapPreviewProps {
  destination: Destination;
  days: DayPlan[];
}

// Cache geocoding results for the session to avoid repeated API calls
const geocodeCache: Map<string, [number, number]> = new Map();

// Nominatim OSM geocoder — free, no API key, great India coverage
async function geocode(query: string, city: string, country: string): Promise<[number, number] | null> {
  const key = `${query}|${city}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  // Try specific place first (e.g. "Rajwada Palace, Indore, India")
  const tryFetch = async (q: string): Promise<[number, number] | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch {
      // ignore
    }
    return null;
  };

  // First try full query, then fall back to city only
  const coords =
    (await tryFetch(`${query}, ${city}, ${country}`)) ??
    (await tryFetch(`${query}, ${city}, India`)) ??
    (await tryFetch(`${city}, ${country}`));

  if (coords) geocodeCache.set(key, coords);
  return coords;
}

// City-level fallback for offline/slow network scenarios
const CITY_COORDINATES: Record<string, [number, number]> = {
  indore: [22.7196, 75.8577],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  'new delhi': [28.6139, 77.209],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
  agra: [27.1767, 78.0081],
  goa: [15.2993, 74.124],
  varanasi: [25.3176, 82.9739],
  kochi: [9.9312, 76.2673],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.385, 78.4867],
  pune: [18.5204, 73.8567],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  amritsar: [31.634, 74.8723],
  shimla: [31.1048, 77.1734],
  manali: [32.2396, 77.1887],
  rishikesh: [30.0869, 78.2676],
};

interface MarkerData {
  name: string;
  day: number;
  time: string;
  coords: [number, number];
}

export const MapPreview: React.FC<MapPreviewProps> = ({ destination, days }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const [geocoding, setGeocoding] = useState(true);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // Step 1: Load Leaflet from CDN
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (window.L) { setLeafletLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Step 2: Geocode each activity with real Nominatim coordinates
  const resolveMarkers = useCallback(async () => {
    setGeocoding(true);
    const activities = days.flatMap(d =>
      d.items.map(item => ({ name: item.activity, day: d.day, time: item.time }))
    );

    const cityKey = destination.city.toLowerCase().trim();
    const cityCoords = CITY_COORDINATES[cityKey] ?? [22.7196, 75.8577];

    const resolved: MarkerData[] = await Promise.all(
      activities.map(async (act, idx) => {
        const coords = await geocode(act.name, destination.city, destination.country);
        if (coords) return { ...act, coords };
        // Fallback: scatter deterministically around city center
        const offsetLat = Math.sin(idx * 1.3) * 0.012;
        const offsetLng = Math.cos(idx * 1.3) * 0.012;
        return { ...act, coords: [cityCoords[0] + offsetLat, cityCoords[1] + offsetLng] as [number, number] };
      })
    );

    setMarkers(resolved);
    setGeocoding(false);
  }, [destination, days]);

  useEffect(() => { resolveMarkers(); }, [resolveMarkers]);

  // Step 3: Render map with real pins once both Leaflet and geocoding are done
  useEffect(() => {
    if (!leafletLoaded || geocoding || !mapContainerRef.current || !window.L) return;

    const L = window.L;

    // Destroy previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const cityKey = destination.city.toLowerCase().trim();
    const centerCoords = CITY_COORDINATES[cityKey] ?? [22.7196, 75.8577];

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(centerCoords, 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // City centre pin (destination overview)
    const cityIcon = L.divIcon({
      className: '',
      html: `<div style="background:#4f46e5;color:#fff;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.3);white-space:nowrap;">${destination.city}</div>`,
      iconAnchor: [40, 12],
    });
    L.marker(centerCoords, { icon: cityIcon }).addTo(map);

    // Activity pins
    const markerCoords: [number, number][] = [];
    markers.forEach((m) => {
      const popupContent = `
        <div style="font-family:sans-serif;min-width:160px;padding:4px">
          <div style="color:#4f46e5;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em">Day ${m.day} · ${m.time}</div>
          <div style="font-weight:600;font-size:14px;margin-top:2px">${m.name}</div>
        </div>`;

      L.marker(m.coords)
        .addTo(map)
        .bindPopup(popupContent);

      markerCoords.push(m.coords);
    });

    // Fit bounds to include all pins
    if (markerCoords.length > 0) {
      const allCoords = [centerCoords, ...markerCoords];
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, geocoding, markers, destination]);

  return (
    <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-3xl border border-border-color overflow-hidden relative shadow-sm z-0">
      {(!leafletLoaded || geocoding) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-text-secondary z-10 bg-gray-50 dark:bg-gray-800">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
          <span>{!leafletLoaded ? 'Loading map…' : `Pinning ${days.flatMap(d => d.items).length} locations…`}</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '320px' }} />
    </div>
  );
};

declare global {
  interface Window { L?: any; }
}
