import React, { useEffect, useRef, useState } from 'react';
import type { Destination } from '../../schemas/destination';
import type { DayPlan } from '../../schemas/itinerary';

interface MapPreviewProps {
  destination: Destination;
  days: DayPlan[];
}

// Coordinates map for common Indian cities to center the map properly
const CITY_COORDINATES: Record<string, [number, number]> = {
  indore: [22.7196, 75.8577],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
  agra: [27.1767, 78.0081],
  goa: [15.2993, 74.1240],
  viranasi: [25.3176, 82.9739],
  varanasi: [25.3176, 82.9739],
  kochi: [9.9312, 76.2673],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
};

export const MapPreview: React.FC<MapPreviewProps> = ({ destination, days }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  // Load Leaflet resources dynamically from CDN
  useEffect(() => {
    // Check if Leaflet CSS is already injected
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is already loaded
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize and update the map once Leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;
    const cityKey = destination.city.toLowerCase().trim();
    const centerCoords = CITY_COORDINATES[cityKey] || [22.7196, 75.8577];

    // Destroy existing map instance to avoid re-initialization error
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current).setView(centerCoords, 13);
    mapInstanceRef.current = map;

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Collect all activities to drop pins
    const activities = days.flatMap(d => d.items.map(item => ({
      name: item.activity,
      day: d.day,
      time: item.time,
    })));

    // Create a LatLng bounds array to auto-fit markers
    const markerCoords: any[] = [];

    // Drop pins for activities with offset so they scatter around the center
    activities.forEach((act, index) => {
      // Create a small, deterministic offset so pins for the same city don't stack directly on top of each other
      const offsetLat = (Math.sin(index * 0.5) * 0.015);
      const offsetLng = (Math.cos(index * 0.5) * 0.015);
      const lat = centerCoords[0] + offsetLat;
      const lng = centerCoords[1] + offsetLng;

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px;">
          <strong style="color: #4f46e5;">Day ${act.day} - ${act.time}</strong><br/>
          <span style="font-weight: bold; font-size: 14px;">${act.name}</span>
        </div>
      `;

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupContent);

      markerCoords.push([lat, lng]);
    });

    // Auto-fit the map to contain all pins if we have them
    if (markerCoords.length > 0) {
      const bounds = L.latLngBounds(markerCoords);
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, destination, days]);

  return (
    <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-3xl border border-border-color overflow-hidden relative shadow-sm z-0">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
          Loading interactive maps...
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '320px' }} />
    </div>
  );
};

// Declare Leaflet global type reference
declare global {
  interface Window {
    L?: any;
  }
}
