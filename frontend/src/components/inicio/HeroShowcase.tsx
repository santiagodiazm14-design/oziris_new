"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface HeroShowcaseProps {
  trendingTags: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedTag: (t: string | null) => void;
}

export default function HeroShowcase({
  trendingTags,
  searchQuery,
  setSearchQuery,
  setSelectedTag,
}: HeroShowcaseProps) {
  return (
    <section className="relative overflow-hidden border-b border-emerald-500/15 py-12 md:py-16 bg-gradient-to-b from-[#0e161c]/80 via-[#090d10] to-[#090d10]">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm shadow-emerald-500/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          <span>Tu mercado de beats</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          Descubre y Adquiere los{" "}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Mejores Beats Urbanos
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl">
          Producciones exclusivas y de alta calidad para artistas de Trap, Drill, Reggaeton y R&B. Escucha, compra y descarga tus pistas al instante.
        </p>

        {/* Quick Search Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-zinc-400 font-mono">Tendencias:</span>
          {trendingTags.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(item);
                setSelectedTag(null);
              }}
              className={`text-xs px-3 py-1 rounded-full transition cursor-pointer ${
                searchQuery === item
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 border border-emerald-300"
                  : "text-zinc-300 bg-[#121921] hover:bg-emerald-500/15 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30"
              }`}
            >
              #{item}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 border-t border-emerald-500/15 w-full max-w-xl">
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-white">100%</p>
            <p className="text-[11px] text-emerald-400 font-medium">Exclusivos</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-teal-300">Audio</p>
            <p className="text-[11px] text-zinc-400 font-medium">WAV + MP3</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">Instant</p>
            <p className="text-[11px] text-zinc-400 font-medium">Descarga Inmediata</p>
          </div>
        </div>
      </div>
    </section>
  );
}
