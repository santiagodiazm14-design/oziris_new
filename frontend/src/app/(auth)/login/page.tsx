"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginApi } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await loginApi(email, password);
      
      login(res.access_token, res.user);

      if (res.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/inicio');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Error al iniciar sesión. Comprueba tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Bienvenido de vuelta</h2>
        <p className="text-zinc-400">Ingresa a tu cuenta para continuar creando en OZIRIS.</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="flex flex-col gap-4 mt-2" onSubmit={handleLogin}>
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Contraseña</label>
            <Link href="/recuperacion-clave" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botón de envío principal */}
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Iniciando Sesión...</span>
            </>
          ) : (
            <>
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-zinc-400">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
