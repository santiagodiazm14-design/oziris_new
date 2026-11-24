"use client";

import { useEffect, useState } from "react";
import { fetchSearchSuggestions } from "@/services/api";
import type { ArtistSuggestion, BeatSuggestion } from "@/types";

export const SEARCH_DEBOUNCE_MS = 180;

interface Loaded {
  forQuery: string;
  artists: ArtistSuggestion[];
  beats: BeatSuggestion[];
  failed: boolean;
}

const EMPTY: Loaded = { forQuery: "", artists: [], beats: [], failed: false };

/**
 * Sugerencias de artistas y beats mientras se escribe. Espera un instante
 * tras la ultima tecla y cancela la peticion anterior para no mostrar
 * resultados viejos. Funciona desde la primera letra.
 */
export function useSearchSuggestions(query: string, enabled: boolean) {
  const q = query.trim();
  const [loaded, setLoaded] = useState<Loaded>(EMPTY);

  useEffect(() => {
    if (!enabled || !q) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetchSearchSuggestions(q, controller.signal);
        setLoaded({ forQuery: q, artists: res.artists, beats: res.beats, failed: false });
      } catch {
        if (!controller.signal.aborted) {
          setLoaded({ forQuery: q, artists: [], beats: [], failed: true });
        }
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, enabled]);

  const active = enabled && !!q;
  return {
    artists: active ? loaded.artists : [],
    beats: active ? loaded.beats : [],
    // Mientras llega la respuesta de esta letra se siguen mostrando las anteriores
    loading: active && loaded.forQuery !== q,
    failed: active && loaded.forQuery === q && loaded.failed,
    resolved: active && loaded.forQuery === q,
  };
}
