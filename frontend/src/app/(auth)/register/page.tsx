"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerApi } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerApi(name, email, password);

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
        <h2 className="text-3xl font-bold text-white tracking-tight">Únete a Oziris</h2>
        <p className="text-zinc-400">Crea tu cuenta y empieza a compartir tu sonido.</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="flex flex-col gap-4 mt-2" onSubmit={handleRegister}>
        {/* Campo de Nombre de Usuario */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Nombre Completo / Productor</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. ProductorXYZ"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
              placeholder="Crea una contraseña (mínimo 6 caracteres)"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botón de Creación de Cuenta */}
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creando Cuenta...</span>
            </>
          ) : (
            <>
              <span>Crear Cuenta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-zinc-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
