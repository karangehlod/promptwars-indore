/**
 * useLocationImage — fetches a real photo for a place name via the
 * Wikimedia (Wikipedia) Action API. Falls back gracefully to a
 * category-based curated Unsplash image if the API call fails or
 * returns no thumbnail.
 *
 * Zero API key required. Wikipedia images are CC-licensed.
 */
import { useState, useEffect, useRef } from 'react';
import { resolvePlaceImage } from './imageResolver';

// Simple in-memory cache so the same place isn't fetched twice per session.
const cache: Map<string, string> = new Map();

// For disambiguation we append city+country to improve accuracy.
function buildSearchQuery(name: string, city?: string): string {
  const parts = [name];
  if (city) parts.push(city);
  return parts.join(' ');
}

async function fetchWikimediaImage(query: string): Promise<string | null> {
  if (cache.has(query)) return cache.get(query)!;

  try {
    // Step 1 — search for best matching Wikipedia article
    const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
    searchUrl.searchParams.set('action', 'query');
    searchUrl.searchParams.set('list', 'search');
    searchUrl.searchParams.set('srsearch', query);
    searchUrl.searchParams.set('srlimit', '1');
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('origin', '*');

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    const hits = searchData?.query?.search ?? [];
    if (hits.length === 0) return null;
    const pageTitle = hits[0].title as string;

    // Step 2 — fetch the page thumbnail using prop=pageimages
    const thumbUrl = new URL('https://en.wikipedia.org/w/api.php');
    thumbUrl.searchParams.set('action', 'query');
    thumbUrl.searchParams.set('titles', pageTitle);
    thumbUrl.searchParams.set('prop', 'pageimages');
    thumbUrl.searchParams.set('pithumbsize', '600');
    thumbUrl.searchParams.set('format', 'json');
    thumbUrl.searchParams.set('origin', '*');

    const thumbRes = await fetch(thumbUrl.toString());
    if (!thumbRes.ok) return null;
    const thumbData = await thumbRes.json();

    const pages = Object.values(thumbData?.query?.pages ?? {}) as Array<{
      thumbnail?: { source: string };
    }>;
    const thumbnail = pages[0]?.thumbnail?.source ?? null;

    if (thumbnail) cache.set(query, thumbnail);
    return thumbnail;
  } catch {
    return null;
  }
}

interface UseLocationImageResult {
  src: string;
  loading: boolean;
}

/**
 * @param placeName  The specific attraction / place name (e.g. "Rajwada Palace")
 * @param city       The city context for disambiguation (e.g. "Indore")
 * @param category   Category fallback for Unsplash (e.g. "historical")
 * @param type       Type fallback for Unsplash (e.g. "recommendation")
 */
export function useLocationImage(
  placeName: string,
  city?: string,
  category?: string,
  type?: string,
): UseLocationImageResult {
  const fallback = resolvePlaceImage(placeName, category, type);
  const [src, setSrc] = useState<string>(fallback);
  const [loading, setLoading] = useState<boolean>(true);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setSrc(fallback); // show fallback immediately while fetching

    const query = buildSearchQuery(placeName, city);
    fetchWikimediaImage(query).then((url) => {
      if (!abortRef.current) {
        setSrc(url ?? fallback);
        setLoading(false);
      }
    });

    return () => {
      abortRef.current = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeName, city]);

  return { src, loading };
}
