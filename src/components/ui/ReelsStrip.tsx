/**
 * ReelsStrip — horizontal scrollable YouTube Shorts strip.
 *
 * - If VITE_YOUTUBE_API_KEY is set: fetches real short videos and shows
 *   thumbnail cards. Clicking a card opens an inline embedded player.
 * - If no API key: shows a single polished "Watch on YouTube →" button.
 */
import React, { useState } from 'react';
import { Clapperboard, ExternalLink, Play, Loader2 } from 'lucide-react';
import { useYouTubeShorts } from '../../utils/useYouTubeShorts';
import type { YTShort } from '../../utils/useYouTubeShorts';

interface ReelsStripProps {
  placeName: string;
  city: string;
}

function youtubeSearchUrl(placeName: string, city: string): string {
  const q = encodeURIComponent(`${placeName} ${city} india travel`);
  return `https://www.youtube.com/results?search_query=${q}&sp=EgIYAQ%3D%3D`; // sp=shorts filter
}

function embedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

const VideoCard: React.FC<{ short: YTShort }> = ({ short }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative flex-shrink-0 w-36 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      onClick={() => setPlaying(true)}
    >
      {playing ? (
        <iframe
          src={embedUrl(short.videoId)}
          title={short.title}
          className="w-36 h-64"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      ) : (
        <>
          <img
            src={short.thumbnail}
            alt={short.title}
            className="w-full h-64 object-cover group-hover:brightness-75 transition-all duration-200"
            loading="lazy"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
          {/* Duration badge */}
          {short.duration && (
            <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
              {short.duration}
            </span>
          )}
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight">
              {short.title}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export const ReelsStrip: React.FC<ReelsStripProps> = ({ placeName, city }) => {
  const { shorts, loading, hasApiKey } = useYouTubeShorts(placeName, city);
  const searchUrl = youtubeSearchUrl(placeName, city);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* YouTube logo SVG */}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#FF0000">
            <path d="M23.5 6.19a3 3 0 0 0-2.11-2.12C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.39.57A3 3 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3 3 0 0 0 2.11 2.12C4.49 20.5 12 20.5 12 20.5s7.51 0 9.39-.57a3 3 0 0 0 2.11-2.12C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
          </svg>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            Watch Reels
          </h4>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          More on YouTube
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin text-red-500" />
          <span>Finding reels for {placeName}…</span>
        </div>
      )}

      {/* Real video cards */}
      {!loading && shorts.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {shorts.map((short) => (
            <div key={short.videoId} className="snap-start">
              <VideoCard short={short} />
            </div>
          ))}
        </div>
      )}

      {/* No results found — show search button */}
      {!loading && hasApiKey && shorts.length === 0 && (
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium w-full justify-center"
        >
          <Clapperboard size={16} className="text-red-500" />
          Search "{placeName}" reels on YouTube
          <ExternalLink size={13} />
        </a>
      )}

      {/* Fallback when no API key */}
      {!hasApiKey && (
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium w-full justify-center"
        >
          <Clapperboard size={16} className="text-red-500" />
          Watch "{placeName}" reels on YouTube →
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
};
