"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Menu,
  Headphones,
  Grid,
  Activity,
  Play,
  Pause,
  Star,
  Tag,
  Zap,
  Mic,
  ShoppingBag,
  X,
  LogOut,
  UploadCloud,
  Music,
} from "lucide-react";
import { fetchTracks, Track } from "@/services/api";
import UploadBeatModal from "@/components/tracks/UploadBeatModal";
import { useCart } from "@/context/CartContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function InicioPage() {
  const { cartCount, toggleCart, addToCart, isInCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(
    undefined
  );

  // Audio player
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadTracks = async (genre?: string) => {
    try {
      setIsLoadingTracks(true);

      const data = await fetchTracks(genre);

      setTracks(data);
    } catch (err) {
      console.error("Error al cargar catálogo de Beats:", err);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadTracks(selectedGenre);
  }, [selectedGenre]);

  const handlePlayTrack = (track: Track) => {
    const fullAudioUrl = track.audioUrl.startsWith("http")
      ? track.audioUrl
      : `${API_BASE_URL}${track.audioUrl}`;

    if (currentlyPlayingId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const newAudio = new Audio(fullAudioUrl);

      audioRef.current = newAudio;

      newAudio
        .play()
        .then(() => {
          setCurrentlyPlayingId(track.id);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Error al reproducir audio:", err);
        });

      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      };
    }
  };

  const topCharts = [
    {
      id: "1",
      title: "Nuevos y Destacados",
      icon: <Activity className="w-6 h-6 text-white" />,
    },
    {
      id: "2",
      title: "Mejores Rankings",
      icon: <Grid className="w-6 h-6 text-blue-500" />,
      active: true,
    },
    {
      id: "3",
      title: "Solo Exclusivos",
      icon: <Star className="w-6 h-6 text-white" />,
    },
    {
      id: "4",
      title: "Menos de $20",
      icon: <Tag className="w-6 h-6 text-white" />,
    },
    {
      id: "5",
      title: "Beats Gratis",
      icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
      id: "6",
      title: "Beats",
      icon: <Play className="w-6 h-6 text-white" />,
    },
    {
      id: "7",
      title: "Beats con Coro",
      icon: <Mic className="w-6 h-6 text-white" />,
    },
  ];

  const tags = [
    "drake",
    "trap",
    "guitar",
    "Travis Scott",
    "lil baby",
    "gunna",
    "rnb",
    "hip hop",
    "Type beat",
    "future",
    "j cole",
    "juice wrld",
  ];

  const filters = [
    "Todo el tiempo",
    "Trap",
    "Hip Hop",
    "Reggaeton",
    "RnB",
    "Pop",
    "Dancehall",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">

      {/* =====================================================
          BANNER
      ====================================================== */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-white/10 px-4 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 mx-auto max-w-7xl w-full">

          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs">
            O Z I R I S
          </span>

          <span className="hidden md:inline font-medium">
            Oziris: Beats para todos
          </span>

          <span className="text-zinc-400 hidden md:inline ml-2">
            Descubre el sonido que buscas con productores reales.
          </span>

          <button className="ml-auto bg-white/10 hover:bg-white/20 transition px-4 py-1.5 rounded-full font-medium">
            Saber Más
          </button>

        </div>
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-white/5 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-30">

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-6">

            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 hover:text-purple-400 transition"
              type="button"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Oziris Logo"
                width={110}
                height={35}
                className="object-contain"
                priority
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">

              <Link
                href="#"
                className="hover:text-white transition"
              >
                Novedades
              </Link>

              <Link
                href="#"
                className="flex items-center gap-1 hover:text-white transition"
              >
                Aprender
                <ChevronDown className="w-4 h-4" />
              </Link>

            </nav>

          </div>

          {/* BUSCADOR */}
          <div className="flex-1 max-w-xl hidden md:flex">

            <div className="w-full relative flex items-center bg-white/5 border border-white/10 rounded-full focus-within:border-purple-500/50 transition-colors">

              <Search className="w-4 h-4 text-zinc-400 absolute left-4" />

              <input
                type="text"
                placeholder="Busca el beat de tu gusto..."
                className="w-full bg-transparent border-none py-2 pl-10 pr-24 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />

              <div className="absolute right-2 flex items-center gap-2 border-l border-white/10 pl-2">

                <span className="text-sm font-medium">
                  Pistas
                </span>

                <ChevronDown className="w-4 h-4 text-zinc-400" />

              </div>

            </div>

          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-4 text-sm font-medium">

            {/* SUBIR BEAT */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg shadow-purple-500/30 transition transform hover:scale-105 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir Beat</span>
            </button>

            {/* REGISTRO / LOGIN */}
            <div className="hidden lg:flex items-center gap-4 text-zinc-400">

              <Link
                href="/register"
                className="hover:text-white transition"
              >
                Registro
              </Link>

              <div className="w-[1px] h-4 bg-white/10"></div>

              <Link
                href="/login"
                className="hover:text-white transition"
              >
                Iniciar Sesión
              </Link>

            </div>

            {/* =================================================
                CARRITO DE COMPRAS EN EL HEADER
            ================================================== */}
            <button
              onClick={toggleCart}
              type="button"
              className="relative flex items-center justify-center p-2.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition ml-2 cursor-pointer group"
              title="Carrito de compras"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* =================================================
            SECONDARY NAV
        ================================================== */}
        <div className="border-t border-white/5 bg-[#0a0a0a] hidden md:block">

          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center gap-8 text-sm font-medium text-zinc-400">

            <Link
              href="#"
              className="flex items-center gap-2 text-white"
            >
              <Activity className="w-4 h-4" />
              Pistas
            </Link>

            <Link
              href="#"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Grid className="w-4 h-4" />
              Colecciones
            </Link>

            <Link
              href="#"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Headphones className="w-4 h-4" />
              Kits de Sonido
            </Link>

            <Link
              href="#"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Menu className="w-4 h-4" />
              Músicos
            </Link>

            <Link
              href="#"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <Star className="w-4 h-4" />
              Modelos de IA
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">

          <div className="flex items-center gap-3">

            <h2 className="text-2xl font-bold tracking-tight">
              Catálogo de Beats
            </h2>

            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full font-normal">
              {tracks.length}{" "}
              {tracks.length === 1 ? "Beat" : "Beats"}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/30 transition transform hover:scale-105 active:scale-95"
            >
              <UploadCloud className="w-5 h-5" />
              <span>+ Subir Nuevo Beat</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition px-3 py-2 rounded-xl text-sm font-medium border border-white/10"
            >
              Filtros
              <ChevronDown className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* =====================================================
            CATEGORIES
        ====================================================== */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">

          {topCharts.map((item) => (

            <button
              key={item.id}
              type="button"
              className="flex flex-col items-center gap-3 snap-start min-w-[100px] group"
            >

              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  item.active
                    ? "border-2 border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    : "bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20"
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-sm font-medium ${
                  item.active
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {item.title}
              </span>

            </button>

          ))}

        </div>

        {/* =====================================================
            TAGS
        ====================================================== */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mt-2">

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 shrink-0">

            <Search className="w-4 h-4 text-zinc-500" />

            <span className="text-sm text-zinc-500">
              Buscar etiquetas
            </span>

          </div>

          {tags.map((tag, i) => (

            <button
              key={i}
              type="button"
              className="bg-white/5 hover:bg-white/10 border border-white/10 transition rounded-full px-4 py-2 text-sm text-zinc-300 shrink-0 capitalize"
            >
              #{tag}
            </button>

          ))}

        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">

          {filters.map((filter, i) => {

            const isSelected =
              (i === 0 && !selectedGenre) ||
              selectedGenre === filter;

            return (

              <button
                key={i}
                type="button"
                onClick={() =>
                  setSelectedGenre(
                    i === 0 ? undefined : filter
                  )
                }
                className={`flex items-center gap-2 transition rounded-full px-4 py-1.5 text-sm font-medium shrink-0 ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {filter}
              </button>

            );
          })}

        </div>

        {/* =====================================================
            BEATS
        ====================================================== */}
        {isLoadingTracks ? (

          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">

            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>

            <p>
              Cargando Beats...
            </p>

          </div>

        ) : tracks.length === 0 ? (

          <div className="flex-1 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl py-20 bg-white/[0.01] gap-4 text-center px-4">

            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">

              <Music className="w-8 h-8" />

            </div>

            <h3 className="text-lg font-bold text-white">
              No se encontraron Beats aún
            </h3>

            <p className="text-sm text-zinc-400 max-w-md">
              Sé el primer productor en publicar su sonido en OZIRIS.
              Haz clic en el botón de abajo para empezar.
            </p>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="mt-2 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium px-6 py-2.5 rounded-full shadow-lg transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Publicar mi primer Beat</span>
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {tracks.map((track) => {

              const isPlayingThis =
                currentlyPlayingId === track.id && isPlaying;

              const coverPath = track.coverUrl
                ? track.coverUrl.startsWith("http")
                  ? track.coverUrl
                  : `${API_BASE_URL}${track.coverUrl}`
                : null;

              return (

                <div
                  key={track.id}
                  className="group relative bg-[#121216] border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 flex flex-col justify-between"
                >

                  {/* INFORMACIÓN PRINCIPAL */}
                  <div className="flex gap-4 items-start">

                    {/* COVER */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 group-hover:border-purple-500/30 transition">

                      {coverPath ? (

                        <img
                          src={coverPath}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-zinc-500">

                          <Music className="w-8 h-8 text-purple-400/60" />

                        </div>

                      )}

                      {/* PLAY */}
                      <button
                        onClick={() => handlePlayTrack(track)}
                        type="button"
                        className={`absolute inset-0 m-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                          isPlayingThis
                            ? "bg-purple-600 text-white scale-100"
                            : "bg-black/60 text-white opacity-90 group-hover:opacity-100 hover:scale-110 hover:bg-purple-600"
                        }`}
                      >

                        {isPlayingThis ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}

                      </button>

                    </div>

                    {/* METADATA */}
                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-2">

                        <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {track.genre || "Beat"}
                        </span>

                        <span className="text-sm font-bold text-emerald-400">
                          ${Number(track.price).toFixed(2)}
                        </span>

                      </div>

                      <h4 className="font-bold text-white text-base truncate mt-1 group-hover:text-purple-300 transition">
                        {track.title}
                      </h4>

                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        Por{" "}
                        <span className="text-zinc-200 font-medium">
                          {track.producer?.name || "Productor OZIRIS"}
                        </span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">

                        {track.bpm && (
                          <span>
                            {track.bpm} BPM
                          </span>
                        )}

                        {track.bpm && track.key && (
                          <span>•</span>
                        )}

                        {track.key && (
                          <span>
                            {track.key}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      TAGS + BOTONES
                  ================================================== */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">

                    {/* TAGS */}
                    <div className="flex gap-1.5 overflow-hidden max-w-[60%]">

                      {track.tags && track.tags.length > 0 ? (

                        track.tags
                          .slice(0, 2)
                          .map((t, idx) => (

                            <span
                              key={idx}
                              className="text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full truncate"
                            >
                              #{t}
                            </span>

                          ))

                      ) : (

                        <span className="text-[11px] text-zinc-500 italic">
                          OZIRIS Exclusive
                        </span>

                      )}

                    </div>

                    {/* BOTONES */}
                    <div className="flex items-center gap-2">

                      {/* ESCUCHAR */}
                      <button
                        onClick={() => handlePlayTrack(track)}
                        type="button"
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                      >
                        {isPlayingThis
                          ? "Pausar"
                          : "Escuchar"}
                      </button>

                      {/* =================================================
                          AGREGAR AL CARRITO / COMPRAR
                      ================================================== */}
                      <button
                        onClick={() => addToCart(track)}
                        type="button"
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition transform hover:scale-105 ${
                          isInCart(track.id)
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isInCart(track.id) ? "En el carrito" : "Agregar"}
                      </button>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </main>

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      {isMenuOpen && (

        <div className="fixed inset-0 z-50 flex">

          {/* FONDO */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* MENU */}
          <div className="relative w-72 bg-[#18181b] border-r border-white/10 h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300">

            <div className="flex items-center justify-between mb-8">

              <span className="text-xl font-bold tracking-widest text-white">
                MENÚ
              </span>

              <button
                onClick={() => setIsMenuOpen(false)}
                type="button"
                className="p-1 hover:bg-white/10 rounded-md transition"
              >
                <X className="w-6 h-6 text-zinc-400 hover:text-white" />
              </button>

            </div>

            <div className="flex flex-col gap-2">

              {/* SUBIR BEAT */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsUploadModalOpen(true);
                }}
                type="button"
                className="flex items-center gap-4 p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition text-purple-200"
              >

                <UploadCloud className="w-5 h-5 text-purple-400" />

                <span className="font-medium text-base">
                  Subir Beat
                </span>

              </button>

              {/* PLANES */}
              <Link
                href="/planes"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition text-zinc-200 hover:text-white"
              >

                <Star className="w-5 h-5 text-purple-400" />

                <span className="font-medium text-base">
                  Ver Planes
                </span>

              </Link>

              {/* =================================================
                  FORMAS DE PAGO
              ================================================== */}
              <Link
                href="/formas-pago"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition text-zinc-200 hover:text-white"
              >

                <ShoppingBag className="w-5 h-5 text-blue-400" />

                <span className="font-medium text-base">
                  Formas de pago
                </span>

              </Link>

              <div className="h-[1px] bg-white/10 my-2"></div>

              {/* CERRAR SESIÓN */}
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 transition text-red-400 hover:text-red-300"
              >

                <LogOut className="w-5 h-5" />

                <span className="font-medium text-base">
                  Cerrar Sesión
                </span>

              </Link>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL SUBIR BEAT
      ====================================================== */}
      <UploadBeatModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(newTrack) => {
          loadTracks(selectedGenre);
        }}
      />

    </div>
  );
}