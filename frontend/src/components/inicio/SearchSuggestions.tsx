"use client";

import React from "react";
import { BadgeCheck, Loader2, Music2, Search as SearchIcon } from "lucide-react";
import type { ArtistSuggestion, BeatSuggestion } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type SuggestionItem =
  | { type: "artist"; data: ArtistSuggestion }
  | { type: "beat"; data: BeatSuggestion };

const mediaUrl = (url?: string | null) =>
  !url ? null : url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

/** Resalta en negrita la parte del texto que coincide con lo escrito. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong className="text-emerald-300 font-bold">{text.slice(i, i + q.length)}</strong>
      {text.slice(i + q.length)}
    </>
  );
}

interface SearchSuggestionsProps {
  id: string;
  query: string;
  artists: ArtistSuggestion[];
  beats: BeatSuggestion[];
  loading: boolean;
  failed: boolean;
  resolved: boolean;
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (item: SuggestionItem) => void;
}

/** Desplegable de resultados: artistas primero, luego beats. */
export default function SearchSuggestions({
  id,
  query,
  artists,
  beats,
  loading,
  failed,
  resolved,
  activeIndex,
  onHover,
  onPick,
}: SearchSuggestionsProps) {
  const hasAny = artists.length > 0 || beats.length > 0;

  const rowClass = (i: number) =>
    `w-full flex items-center gap-3 px-3 py-2 text-left transition cursor-pointer ${
      activeIndex === i ? "bg-emerald-500/15" : "hover:bg-white/5"
    }`;

  return (
    <div
      id={id}
      role="listbox"
      aria-label="Sugerencias de búsqueda"
      className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#131c24] border border-emerald-500/25 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2"
    >
      {loading && !hasAny && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          Buscando...
        </div>
      )}

      {failed && (
        <div className="px-4 py-3 text-xs text-red-300">
          No pudimos buscar en este momento. Intenta de nuevo.
        </div>
      )}

      {resolved && !failed && !hasAny && (
        <div className="px-4 py-4 text-sm text-zinc-400">
          Sin resultados para <span className="text-white">«{query.trim()}»</span>
        </div>
      )}

      {artists.length > 0 && (
        <div role="group" aria-label="Artistas">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Artistas
          </p>
          {artists.map((a, idx) => {
            const avatar = mediaUrl(a.avatarUrl);
            return (
              <button
                key={a.id}
                id={`${id}-opt-${idx}`}
                type="button"
                role="option"
                aria-selected={activeIndex === idx}
                onMouseEnter={() => onHover(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick({ type: "artist", data: a })}
                className={rowClass(idx)}
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-300 shrink-0">
                    {a.artistName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-semibold text-white truncate">
                    <Highlight text={a.artistName} query={query} />
                    {a.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </span>
                  <span className="block text-xs text-zinc-400 truncate">
                    {a.genre ? `${a.genre} · ` : ""}
                    {a.tracksCount} {a.tracksCount === 1 ? "beat" : "beats"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {beats.length > 0 && (
        <div role="group" aria-label="Beats">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Beats
          </p>
          {beats.map((b, i) => {
            const idx = artists.length + i;
            const cover = mediaUrl(b.coverUrl);
            return (
              <button
                key={b.id}
                id={`${id}-opt-${idx}`}
                type="button"
                role="option"
                aria-selected={activeIndex === idx}
                onMouseEnter={() => onHover(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick({ type: "beat", data: b })}
                className={rowClass(idx)}
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10" />
                ) : (
                  <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Music2 className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white truncate">
                    <Highlight text={b.title} query={query} />
                  </span>
                  <span className="block text-xs text-zinc-400 truncate">
                    {b.producer.artistName}
                    {b.genre ? ` · ${b.genre}` : ""}
                    {b.bpm ? ` · ${b.bpm} BPM` : ""}
                  </span>
                </span>
                <SearchIcon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
