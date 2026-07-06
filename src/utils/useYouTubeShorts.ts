/**
 * useYouTubeShorts — fetches relevant YouTube Shorts for a given place.
 *
 * Uses YouTube Data API v3 when VITE_YOUTUBE_API_KEY is configured.
 * Falls back gracefully (returns empty array) if not configured.
 * Results are cached per place+city to avoid redundant quota consumption.
 */

export interface YTShort {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string; // ISO 8601 duration (PT1M23S)
}

const cache = new Map<string, YTShort[]>();

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

function buildQuery(placeName: string, city: string): string {
  return `${placeName} ${city} india travel shorts`;
}

/** Parse ISO 8601 duration (PT1M23S) → "1:23" */
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] ?? '0');
  const m = parseInt(match[2] ?? '0');
  const s = parseInt(match[3] ?? '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function fetchYouTubeShorts(
  placeName: string,
  city: string,
): Promise<YTShort[]> {
  if (!API_KEY) return [];

  const cacheKey = `${placeName}|${city}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    // Step 1: Search for videos — filter to videoDuration=short (≤4 minutes)
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', buildQuery(placeName, city));
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('videoDuration', 'short');
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('maxResults', '5');
    searchUrl.searchParams.set('relevanceLanguage', 'en');
    searchUrl.searchParams.set('regionCode', 'IN');
    searchUrl.searchParams.set('key', API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      console.warn('[YouTube] Search failed:', searchRes.status);
      return [];
    }
    const searchData = await searchRes.json();
    const items = searchData.items ?? [];
    if (items.length === 0) return [];

    // Step 2: Fetch video durations via videos endpoint
    const videoIds = items.map((i: any) => i.id.videoId).join(',');
    const detailUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailUrl.searchParams.set('part', 'contentDetails');
    detailUrl.searchParams.set('id', videoIds);
    detailUrl.searchParams.set('key', API_KEY);

    const detailRes = await fetch(detailUrl.toString());
    const detailData = detailRes.ok ? await detailRes.json() : { items: [] };
    const durMap: Record<string, string> = {};
    for (const v of detailData.items ?? []) {
      durMap[v.id] = formatDuration(v.contentDetails?.duration ?? '');
    }

    const shorts: YTShort[] = items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      duration: durMap[item.id.videoId] ?? '',
    }));

    cache.set(cacheKey, shorts);
    return shorts;
  } catch (err) {
    console.warn('[YouTube] Fetch error:', err);
    return [];
  }
}

import { useState, useEffect } from 'react';

interface UseYouTubeShortsResult {
  shorts: YTShort[];
  loading: boolean;
  hasApiKey: boolean;
}

export function useYouTubeShorts(
  placeName: string,
  city: string,
): UseYouTubeShortsResult {
  const hasApiKey = !!API_KEY;
  const [shorts, setShorts] = useState<YTShort[]>([]);
  const [loading, setLoading] = useState(hasApiKey);

  useEffect(() => {
    if (!hasApiKey) return;
    let cancelled = false;
    setLoading(true);
    fetchYouTubeShorts(placeName, city).then((results) => {
      if (!cancelled) {
        setShorts(results);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [placeName, city, hasApiKey]);

  return { shorts, loading, hasApiKey };
}
