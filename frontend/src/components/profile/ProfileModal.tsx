"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfileApi, uploadAvatarApi } from '@/services/api';
import {
  X,
  User as UserIcon,
  MapPin,
  Mic,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, token, updateCurrentUser } = useAuth();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLastName(user.lastName || '');
      setArtistName(user.artistName || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      setIsUploadingAvatar(true);
      const res = await uploadAvatarApi(token, file);
      setAvatarUrl(res.avatarUrl || null);
      updateCurrentUser({ avatarUrl: res.avatarUrl });
      showNotification('success', 'Foto de perfil actualizada correctamente.');
    } catch (err: any) {
      showNotification('error', err.message || 'Error al subir la imagen de avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsSaving(true);
      const updatedUser = await updateProfileApi(token, {
        name,
        lastName,
        artistName,
        location,
        bio,
      });

      updateCurrentUser({
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        artistName: updatedUser.artistName,
        location: updatedUser.location,
        bio: updatedUser.bio,
      });

      showNotification('success', 'Perfil guardado con éxito.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const fullAvatarPath = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${API_BASE_URL}${avatarUrl}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm animate-in slide-in-from-top duration-300 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/90 border-red-500/40 text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Editar Perfil de Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* AVATAR UPLOAD SECTION */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/40 bg-zinc-900 shadow-xl group">
              {fullAvatarPath ? (
                <img src={fullAvatarPath} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50 text-white font-extrabold text-3xl">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Upload Overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1 text-purple-300" />
                    <span className="text-[11px] font-semibold">Cambiar Foto</span>
                  </>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>
            <p className="text-xs text-zinc-400">Haz clic en la imagen para subir tu foto de perfil</p>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nombre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Apellido</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre de Artista / Productor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nombre de Artista / Productor</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mic className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Ej. ProducerXYZ / Lil Beats"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Ubicación (Location) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Ubicación (País / Ciudad)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Medellín, Colombia"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Biografía */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Biografía / Descripción</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe una breve descripción de tu carrera, estilo musical o sobre ti..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
