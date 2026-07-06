/**
 * LocationImage — a drop-in <img> replacement that fetches a real
 * Wikipedia/Wikimedia photo for the given place name with a city hint.
 * Shows a shimmer skeleton while loading and falls back to the existing
 * curated Unsplash image if Wikipedia has no result.
 */
import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useLocationImage } from '../../utils/useLocationImage';

interface LocationImageProps {
  /** The specific attraction / place name (e.g. "Rajwada Palace") */
  name: string;
  /** Category hint for Unsplash fallback (e.g. "historical") */
  category?: string;
  /** Type hint for Unsplash fallback (e.g. "hiddenGem") */
  type?: string;
  className?: string;
  alt?: string;
}

export const LocationImage: React.FC<LocationImageProps> = ({
  name,
  category,
  type,
  className = 'w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out',
  alt,
}) => {
  const city = useAppStore(s => s.destination?.city);
  const { src, loading } = useLocationImage(name, city, category, type);

  return (
    <>
      {/* Shimmer skeleton while the real photo loads */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt ?? name}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0';
        }}
      />
    </>
  );
};
