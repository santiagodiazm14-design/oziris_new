"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-950/40 via-[#0c1217] to-teal-950/40 border-b border-emerald-500/15 px-4 py-2 text-xs sm:text-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl w-full">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider shadow-sm shadow-emerald-500/20">
            OZIRIS PRO
          </span>
          <span className="font-semibold text-zinc-200">
            Catálogo Oficial de Beats & Instrumentales
          </span>
          <span className="text-zinc-400 hidden md:inline">
            • Licencias 100% libres de regalías con entrega inmediata
          </span>
        </div>

        <Link
          href="/planes"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-3 py-1 rounded-full transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ver Planes</span>
        </Link>
      </div>
    </div>
  );
}
