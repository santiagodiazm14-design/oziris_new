"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  Headphones,
  Music,
  CheckCircle2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerApi } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<'USER' | 'ARTIST'>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [artisticName, setArtisticName] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (accountType === 'ARTIST' && !artisticName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre artístico o de productor.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerApi({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        accountType,
        artisticName: accountType === 'ARTIST' ? artisticName.trim() : undefined,
        genre: accountType === 'ARTIST' && genre.trim() ? genre.trim() : undefined,
      });

      register(res.access_token, res.user);
      router.push('/inicio');
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMessage(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium w-fit mx-auto lg:mx-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comunidad Oziris Music</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Crea tu cuenta</h2>
        <p className="text-zinc-400 text-sm">
          Elige cómo deseas experimentar la plataforma y empieza ahora.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleRegister}>
        {/* SELECTOR DE TIPO DE CUENTA: USUARIO VS ARTISTA */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Tipo de Perfil
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción 1: Usuario Normal */}
            <button
              type="button"
              onClick={() => setAccountType('USER')}
              className={`relative flex flex-col items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                accountType === 'USER'
                  ? 'bg-purple-600/15 border-purple-500 ring-2 ring-purple-500/30 text-white shadow-lg shadow-purple-900/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    accountType === 'USER'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  <Headphones className="w-5 h-5" />
                </div>
                {accountType === 'USER' && (
                  <CheckCircle2 className="w-5 h-5 text-purple-400 animate-in zoom-in-75 duration-200" />
                )}
              </div>
              <span className="font-semibold text-sm text-white">Usuario / Oyente</span>
              <span className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Descubre instrumentales, guarda tus favoritos y adquiere licencias.
              </span>
            </button>

            {/* Opción 2: Artista / Productor */}
            <button
              type="button"
              onClick={() => setAccountType('ARTIST')}
              className={`relative flex flex-col items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                accountType === 'ARTIST'
                  ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-zinc-300 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    accountType === 'ARTIST'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  <Music className="w-5 h-5" />
                </div>
                {accountType === 'ARTIST' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-400 animate-in zoom-in-75 duration-200" />
                )}
              </div>
              <span className="font-semibold text-sm text-white">Artista / Productor</span>
              <span className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Sube tus pistas, vende licencias y gestiona tu catálogo de beats.
              </span>
            </button>
          </div>
        </div>

        {/* CAMPOS DINÁMICOS PARA ARTISTA */}
        {accountType === 'ARTIST' && (
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Información de tu Perfil Artístico</span>
            </div>

            {/* Nombre Artístico */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Nombre Artístico / Productor <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Music className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  required={accountType === 'ARTIST'}
                  value={artisticName}
                  onChange={(e) => setArtisticName(e.target.value)}
                  placeholder="Ej. Oziris Beats, DJ Metro"
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Género Principal */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Género Principal <span className="text-zinc-500">(Opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-zinc-500" />
                </div>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="" className="bg-zinc-900 text-zinc-400">Seleccionar género musical...</option>
                  <option value="Trap" className="bg-zinc-900 text-white">Trap</option>
                  <option value="Reggaeton" className="bg-zinc-900 text-white">Reggaeton</option>
                  <option value="Drill" className="bg-zinc-900 text-white">Drill</option>
                  <option value="Hip Hop" className="bg-zinc-900 text-white">Hip Hop / Boombap</option>
                  <option value="R&B" className="bg-zinc-900 text-white">R&B / Soul</option>
                  <option value="Afrobeats" className="bg-zinc-900 text-white">Afrobeats</option>
                  <option value="Dancehall" className="bg-zinc-900 text-white">Dancehall</option>
                  <option value="Pop" className="bg-zinc-900 text-white">Pop / Electrónica</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Campo de Nombre Real */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Campo de Correo Electrónico */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Campo de Contraseña */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Botón de Creación de Cuenta */}
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50 cursor-pointer text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creando cuenta...</span>
            </>
          ) : (
            <>
              <span>
                {accountType === 'ARTIST' ? 'Crear Perfil de Artista' : 'Crear Cuenta de Usuario'}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-2 text-center text-zinc-400 text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
