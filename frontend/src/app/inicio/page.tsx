"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, Menu, Headphones, Grid, Activity, Play, Star, Tag, Zap, Mic, Flame, ShoppingBag, X, LogOut } from 'lucide-react';

export default function InicioPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const topCharts = [
    { id: '1', title: 'Nuevos y Destacados', icon: <Activity className="w-6 h-6 text-white" /> },
    { id: '2', title: 'Mejores Rankings', icon: <Grid className="w-6 h-6 text-blue-500" />, active: true },
    { id: '3', title: 'Solo Exclusivos', icon: <Star className="w-6 h-6 text-white" /> },
    { id: '4', title: 'Menos de $20', icon: <Tag className="w-6 h-6 text-white" /> },
    { id: '5', title: 'Beats Gratis', icon: <Zap className="w-6 h-6 text-white" /> },
    { id: '6', title: 'Beats', icon: <Play className="w-6 h-6 text-white" /> },
    { id: '7', title: 'Beats con Coro', icon: <Mic className="w-6 h-6 text-white" /> },
  ];

  const tags = ['drake', 'trap', 'guitar', 'Travis Scott', 'lil baby', 'gunna', 'rnb', 'hip hop', 'Type beat', 'future', 'j cole', 'juice wrld'];

  const filters = ['Todo el tiempo', 'Género', 'Tipo de pista', 'Precio', 'Estado de ánimo', 'BPM', 'Instrumentos', 'Tono', 'Duración', 'Energía', 'Vocales'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-white/10 px-4 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 mx-auto max-w-7xl w-full">
          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs">O Z I R I S</span>
          <span className="hidden md:inline font-medium">Oziris: Beats para todos</span>
          <span className="text-zinc-400 hidden md:inline ml-2">Descubre el sonido que buscas con productores reales.</span>
          <button className="ml-auto bg-white/10 hover:bg-white/20 transition px-4 py-1.5 rounded-full font-medium">Saber Más</button>
        </div>
      </div>

      {/* Header (Navbar) */}
      <header className="border-b border-white/5 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 hover:text-purple-400 transition">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Oziris Logo" width={110} height={35} className="object-contain" priority />
            </Link>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <Link href="#" className="hover:text-white transition">Novedades</Link>
              <Link href="#" className="flex items-center gap-1 hover:text-white transition">
                Aprender <ChevronDown className="w-4 h-4" />
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-xl hidden md:flex">
            <div className="w-full relative flex items-center bg-white/5 border border-white/10 rounded-full focus-within:border-purple-500/50 transition-colors">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4" />
              <input 
                type="text" 
                placeholder="Busca el beat de tu gusto" 
                className="w-full bg-transparent border-none py-2 pl-10 pr-24 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-2 border-l border-white/10 pl-2">
                <span className="text-sm font-medium">Pistas</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="hidden lg:flex items-center gap-4 text-zinc-400">
              <Link href="/register" className="hover:text-white transition">Registro</Link>
              <div className="w-[1px] h-4 bg-white/10"></div>
              <Link href="/login" className="hover:text-white transition">Iniciar Sesión</Link>
            </div>
            <button className="text-zinc-400 hover:text-white transition ml-2">
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Secondary Nav */}
        <div className="border-t border-white/5 bg-[#0a0a0a] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#" className="flex items-center gap-2 text-white"><Activity className="w-4 h-4" /> Pistas</Link>
            <Link href="#" className="flex items-center gap-2 hover:text-white transition"><Grid className="w-4 h-4" /> Colecciones</Link>
            <Link href="#" className="flex items-center gap-2 hover:text-white transition"><Headphones className="w-4 h-4" /> Kits de Sonido</Link>
            <Link href="#" className="flex items-center gap-2 hover:text-white transition"><Menu className="w-4 h-4" /> Músicos</Link>
            <Link href="#" className="flex items-center gap-2 hover:text-white transition"><Star className="w-4 h-4" /> Modelos de IA</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Mejores Rankings</h2>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition px-3 py-1.5 rounded-lg text-sm font-medium">
            Ocultar <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Categories (Top Charts Carousel) */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {topCharts.map((item) => (
            <button 
              key={item.id} 
              className={`flex flex-col items-center gap-3 snap-start min-w-[100px] group`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                item.active 
                  ? 'border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20'
              }`}>
                {item.icon}
              </div>
              <span className={`text-sm font-medium ${item.active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                {item.title}
              </span>
            </button>
          ))}
          <div className="flex items-center justify-center pl-2">
            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10">
              <ChevronDown className="w-5 h-5 -rotate-90 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 shrink-0">
            <Search className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-500">Buscar etiquetas</span>
          </div>
          {tags.map((tag, i) => (
            <button key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 transition rounded-full px-4 py-2 text-sm text-zinc-300 shrink-0 capitalize">
              {tag}
            </button>
          ))}
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition rounded-full px-4 py-2 text-sm text-zinc-300 shrink-0 ml-auto">
            <Activity className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium shrink-0">
            Todo el tiempo <ChevronDown className="w-4 h-4" />
          </button>
          {filters.slice(1).map((filter, i) => (
            <button key={i} className="flex items-center gap-2 hover:bg-white/5 transition rounded-full px-4 py-1.5 text-sm text-zinc-400 hover:text-white shrink-0">
              {filter} <ChevronDown className="w-4 h-4" />
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-2 shrink-0 border-l border-white/10 pl-4">
            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10">
              <Star className="w-4 h-4 text-zinc-400" />
            </button>
            <div className="flex bg-white/5 rounded-lg border border-white/10 p-0.5">
              <button className="p-1.5 rounded-md bg-white/10"><Menu className="w-4 h-4 text-white" /></button>
              <button className="p-1.5 rounded-md hover:bg-white/10"><Grid className="w-4 h-4 text-zinc-400" /></button>
            </div>
          </div>
        </div>

        {/* Placeholder Main content */}
        <div className="flex-1 flex items-center justify-center border border-white/5 border-dashed rounded-3xl mt-8 py-20 bg-white/[0.02]">
          <div className="flex flex-col items-center gap-4 text-zinc-500">
            <Flame className="w-12 h-12" />
            <p className="font-medium">Los beats aparecerán aquí.</p>
          </div>
        </div>
      </main>

      {/* Sidebar Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-72 bg-[#18181b] border-r border-white/10 h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-widest text-white">MENÚ</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-md transition">
                <X className="w-6 h-6 text-zinc-400 hover:text-white" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/planes" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition text-zinc-200 hover:text-white">
                <Star className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-base">Ver Planes</span>
              </Link>
              
              <div className="h-[1px] bg-white/10 my-2"></div>
              
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 transition text-red-400 hover:text-red-300">
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-base">Cerrar Sesión</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
