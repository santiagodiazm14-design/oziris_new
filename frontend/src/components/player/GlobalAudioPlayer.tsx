"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { WaveformSeekbar } from "./WaveformSeekbar";
import { API_URL } from "@/services/config";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  ShoppingBag,
  Check,
  X,
  Music,
  ListMusic,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export const GlobalAudioPlayer: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    audioError,
    togglePlay,
    seekTo,
    seekBy,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    toggleLoop,
    closePlayer,
  } = usePlayer();

  const { addToCart, isInCart } = useCart();
  const { isFavorite: checkIsFav, toggleFavorite } = useFavorites();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Páginas de autenticación donde NUNCA debe mostrarse ni sonar la barra
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/recuperacion-clave" ||
    pathname === "/" ||
    Boolean(pathname?.startsWith("/login")) ||
    Boolean(pathname?.startsWith("/register")) ||
    Boolean(pathname?.startsWith("/recuperacion-clave"));

  // Si no está autenticado o entra a login/registro, detener inmediatamente la reproducción
  useEffect(() => {
    if (!isAuthenticated || isAuthPage) {
      if (currentTrack) {
        closePlayer();
      }
    }
  }, [isAuthenticated, isAuthPage, currentTrack, closePlayer]);

  // Solo renderizar el reproductor cuando el usuario esté autenticado, no esté en páginas de autenticación y haya seleccionado un beat
  if (!isAuthenticated || isAuthPage || !currentTrack) {
    return null;
  }

  const inCart = isInCart(currentTrack.id);
  const isFav = checkIsFav(currentTrack.id);

  const handleBuyClick = () => {
    addToCart(currentTrack);
  };

  const coverSrc = currentTrack.coverUrl
    ? currentTrack.coverUrl.startsWith("http://") ||
      currentTrack.coverUrl.startsWith("https://") ||
      currentTrack.coverUrl.startsWith("blob:")
      ? currentTrack.coverUrl
      : `${API_URL}${currentTrack.coverUrl.startsWith("/") ? "" : "/"}${currentTrack.coverUrl}`
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#09090e]/95 backdrop-blur-2xl border-t border-purple-500/25 shadow-[0_-10px_35px_rgba(147,51,234,0.2)] transition-all duration-300 animate-in slide-in-from-bottom-5">
      {/* ERROR ALERT IF AUDIO FAILS */}
      {audioError && (
        <div className="bg-red-500/90 text-white text-xs px-4 py-1.5 text-center font-medium">
          {audioError}
        </div>
      )}

      {/* TOP SECTION: WAVEFORM SEEKBAR WITH TIMESTAMPS */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-1.5">
        <WaveformSeekbar
          currentTime={currentTime}
          duration={duration}
          trackId={currentTrack.id}
          onSeek={seekTo}
        />
      </div>

      {/* BOTTOM SECTION: TRACK INFO & CONTROLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* LEFT: COVER ART & TRACK DETAILS */}
        <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs md:max-w-sm">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-purple-500/20 shrink-0 shadow-md group">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/60 to-blue-900/60 text-purple-300">
                <Music className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🔥</span>
              <h4 className="text-sm font-bold text-white truncate tracking-tight hover:text-purple-300 transition cursor-pointer">
                {currentTrack.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="font-medium text-zinc-300 truncate max-w-[120px]">
                {currentTrack.producer?.name || "OZIRIS Producer"}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400/20" />
              {currentTrack.bpm && (
                <span className="font-mono text-[11px] text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded-full shrink-0">
                  {currentTrack.bpm} BPM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: PLAYBACK CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Favorite Heart Button */}
          <button
            onClick={() => toggleFavorite(currentTrack)}
            title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
            className={`p-2 rounded-full transition transform active:scale-90 ${
              isFav
                ? "text-rose-500 hover:text-rose-400 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            title="Pista anterior"
            className="p-2 text-zinc-400 hover:text-purple-300 hover:bg-white/5 rounded-full transition"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Rewind 10 Seconds */}
          <button
            onClick={() => seekBy(-10)}
            title="Retroceder 10 segundos"
            className="hidden md:flex p-2 text-zinc-400 hover:text-purple-300 hover:bg-white/5 rounded-full transition items-center justify-center relative"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="absolute text-[8px] font-bold font-mono">10</span>
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? "Pausar" : "Reproducir"}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            )}
          </button>

          {/* Advance 10 Seconds */}
          <button
            onClick={() => seekBy(10)}
            title="Adelantar 10 segundos"
            className="hidden md:flex p-2 text-zinc-400 hover:text-purple-300 hover:bg-white/5 rounded-full transition items-center justify-center relative"
          >
            <RotateCw className="w-4 h-4" />
            <span className="absolute text-[8px] font-bold font-mono">10</span>
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            title="Siguiente pista"
            className="p-2 text-zinc-400 hover:text-purple-300 hover:bg-white/5 rounded-full transition"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Loop / Repeat Toggle */}
          <button
            onClick={toggleLoop}
            title={isLooping ? "Repetición activada" : "Repetir Beat"}
            className={`p-2 rounded-full transition ${
              isLooping
                ? "text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT: VOLUME, BUY BUTTON & CLOSE */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Volume Control */}
          <div
            className="relative hidden sm:flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              title={isMuted ? "Desactivar silencio" : "Silenciar"}
              className="p-2 text-zinc-400 hover:text-cyan-300 hover:bg-white/5 rounded-full transition"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Volume Popover Slider */}
            <div
              className={`flex items-center transition-all duration-200 ${
                showVolumeSlider ? "w-20 opacity-100 ml-1" : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* BUY / PRICE BUTTON */}
          <button
            onClick={handleBuyClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition transform hover:scale-105 active:scale-95 ${
              inCart
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 border border-purple-400/20"
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>En Carrito</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>${Number(currentTrack.price).toFixed(2)}</span>
              </>
            )}
          </button>

          {/* Close Player */}
          <button
            onClick={closePlayer}
            title="Cerrar reproductor"
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
