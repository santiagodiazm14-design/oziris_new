"use client";

import React from "react";

interface CategoryItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface CategoriesCarouselProps {
  topCharts: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setSelectedGenre: (genre: string | undefined) => void;
  setSelectedTag: (tag: string | null) => void;
}

export default function CategoriesCarousel({
  topCharts,
  selectedCategory,
  setSelectedCategory,
  setSelectedGenre,
  setSelectedTag,
}: CategoriesCarouselProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
      {topCharts.map((item) => {
        const isCategoryActive = selectedCategory === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedCategory(item.id);
              if (item.id === "all" || item.id === "rankings") {
                setSelectedGenre(undefined);
                setSelectedTag(null);
              }
            }}
            className="flex flex-col items-center gap-3 snap-start min-w-[105px] group cursor-pointer"
          >
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isCategoryActive
                  ? "border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-105 text-emerald-300"
                  : "bg-[#10171e] border border-white/10 text-zinc-400 group-hover:bg-[#141e27] group-hover:border-emerald-500/40 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              }`}
            >
              {item.icon}
            </div>

            <span
              className={`text-xs font-semibold ${
                isCategoryActive
                  ? "text-emerald-400 font-bold"
                  : "text-zinc-400 group-hover:text-zinc-200"
              }`}
            >
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
