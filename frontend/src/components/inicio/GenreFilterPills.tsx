"use client";

import React from "react";

interface GenreFilterPillsProps {
  genreFilters: string[];
  selectedGenre: string | undefined;
  setSelectedGenre: (genre: string | undefined) => void;
}

export default function GenreFilterPills({
  genreFilters,
  selectedGenre,
  setSelectedGenre,
}: GenreFilterPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {genreFilters.map((filter, i) => {
        const isSelected = (i === 0 && !selectedGenre) || selectedGenre === filter;

        return (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedGenre(i === 0 ? undefined : filter)}
            className={`flex items-center gap-2 transition rounded-full px-4 py-1.5 text-xs font-bold shrink-0 cursor-pointer ${
              isSelected
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 border border-emerald-300"
                : "bg-[#10171e] text-zinc-300 hover:text-white hover:bg-[#141e27] border border-white/10 hover:border-emerald-500/30"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
