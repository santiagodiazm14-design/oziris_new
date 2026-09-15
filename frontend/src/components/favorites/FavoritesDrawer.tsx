"use client";

import React from 'react';
import { Track } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Heart, X, Music, Play, ShoppingBag, Trash2 } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Track[];
  onRemoveFavorite: (trackId: string) => void;
  onPlayTrack: (track: Track) => void;
  currentlyPlayingId?: string | null;
  isPlaying?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onPlayTrack,
  currentlyPlayingId,
  isPlaying,
}: FavoritesDrawerProps) {
  const { addToCart, isInCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#121216] border-l border-white/10 h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-300 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mis Favoritos</h3>
              <p className="text-xs text-zinc-400 font-mono">
                {favorites.length} {favorites.length === 1 ? 'Beat guardado' : 'Beats guardados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 gap-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-white">Aún no tienes favoritos</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Haz clic en el ícono de corazón ❤️ en cualquier Beat del catálogo para guardarlo en tu lista personal.
              </p>
            </div>
          ) : (
            favorites.map((track) => {
              const coverPath = track.coverUrl
                ? track.coverUrl.startsWith('http')
                  ? track.coverUrl
                  : `${API_BASE_URL}${track.coverUrl}`
                : null;
              const isPlayingThis = currentlyPlayingId === track.id && isPlaying;

              return (
                <div
                  key={track.id}
                  className="bg-white/5 border border-white/10 hover:border-rose-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                      {coverPath ? (
                        <img src={coverPath} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-6 h-6 text-purple-400 m-auto inset-0 absolute" />
                      )}
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-90 group-hover:opacity-100 hover:scale-110 transition"
                      >
                        <Play className={`w-5 h-5 ml-0.5 ${isPlayingThis ? 'text-rose-400' : ''}`} />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-rose-300 transition">
                        {track.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {track.genre || 'Beat'} • <span className="text-emerald-400 font-bold">${Number(track.price).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addToCart(track)}
                      className={`p-2 rounded-xl transition ${
                        isInCart(track.id)
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/10 hover:bg-purple-600 text-white'
                      }`}
                      title="Agregar al Carrito"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(track.id)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
