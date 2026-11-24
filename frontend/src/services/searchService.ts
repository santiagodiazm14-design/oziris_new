import { API_URL } from './config';
import type { SearchSuggestions } from '@/types';

/** Sugerencias de artistas y beats para el autocompletado de la barra. */
export async function fetchSearchSuggestions(
  query: string,
  signal?: AbortSignal,
  limit = 5,
): Promise<SearchSuggestions> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_URL}/search?${params.toString()}`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('No fue posible buscar en este momento.');
  }
  const data = await res.json();
  return {
    query: data.query ?? query,
    artists: Array.isArray(data.artists) ? data.artists : [],
    beats: Array.isArray(data.beats) ? data.beats : [],
  };
}
