"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginApi } from '@/services/api';
import { ApiError } from '@/services/http';
import { SESSION_EXPIRED_KEY } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Segundos que faltan para poder reintentar (despues de 5 intentos fallidos)
  const [lockSeconds, setLockSeconds] = useState(0);
  const [expiredNotice, setExpiredNotice] = useState(false);

  // Aviso cuando la sesion se cerro por inactividad
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_EXPIRED_KEY)) {
        sessionStorage.removeItem(SESSION_EXPIRED_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leer el aviso guardado al cargar la pagina
        setExpiredNotice(true);
      }
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  // Cuenta regresiva del bloqueo
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setTimeout(() => {
      // Al terminar la espera desaparece el aviso de bloqueo
      if (lockSeconds <= 1) setErrorMessage(null);
      setLockSeconds(lockSeconds - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [lockSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockSeconds > 0) return;
    setErrorMessage(null);
    setExpiredNotice(false);

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
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof ApiError && err.status === 429 && err.retryAfter) {
        setLockSeconds(Math.ceil(err.retryAfter));
      }
      setErrorMessage((err as Error)?.message || 'Error al iniciar sesión. Comprueba tus credenciales.');
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

      {expiredNotice && !errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-200 text-sm animate-in fade-in duration-300">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Tu sesión se cerró por inactividad. Inicia sesión de nuevo para continuar.</span>
        </div>
      )}

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
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Campo de Contraseña */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Contraseña</label>
            <Link href="/recuperacion-clave" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
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
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botón de envío principal */}
        <button
          type="submit"
          disabled={isLoading || lockSeconds > 0}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Iniciando Sesión...</span>
            </>
          ) : lockSeconds > 0 ? (
            <>
              <Clock className="w-5 h-5 text-slate-950" />
              <span>Espera {lockSeconds} s para reintentar</span>
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
        <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
