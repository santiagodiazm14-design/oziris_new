"use client";

import React from "react";
import { RotateCcw, SlidersHorizontal, UploadCloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CatalogHeaderProps {
  trackCount: number;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  setIsUploadModalOpen: (open: boolean) => void;
}

export default function CatalogHeader({
  trackCount,
  hasActiveFilters,
  clearAllFilters,
  selectedSort,
  setSelectedSort,
  setIsUploadModalOpen,
}: CatalogHeaderProps) {
  const { isArtist } = useAuth();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-emerald-500/15 pb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Catálogo de Beats</span>
          <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
            {trackCount} {trackCount === 1 ? "Beat disponible" : "Beats disponibles"}
          </span>
        </h2>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            type="button"
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar Filtros</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* ORDENAMIENTO */}
        <div className="flex items-center gap-2 bg-[#10171e] border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ordenar:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="newest" className="bg-[#10171e]">Más recientes</option>
            <option value="price_asc" className="bg-[#10171e]">Menor precio</option>
            <option value="price_desc" className="bg-[#10171e]">Mayor precio</option>
            <option value="bpm_asc" className="bg-[#10171e]">BPM (Tempo)</option>
          </select>
        </div>

        {isArtist && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            type="button"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 border border-emerald-300/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 text-slate-950" />
            <span>+ Subir Nuevo Beat</span>
          </button>
        )}
      </div>
    </div>
  );
}
