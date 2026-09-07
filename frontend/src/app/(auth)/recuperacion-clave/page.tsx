"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Hash, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:4000/auth'; // Replace with actual backend URL later

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al solicitar el código.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        setStep(3);
      } else {
        const data = await res.json();
        setError(data.message || 'Código incorrecto o expirado.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (res.ok) {
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {step === 1 && 'Recuperar contraseña'}
          {step === 2 && 'Verificar código'}
          {step === 3 && 'Nueva contraseña'}
          {step === 4 && '¡Todo listo!'}
        </h2>
        <p className="text-zinc-400">
          {step === 1 && 'Ingresa tu correo para recibir un código de recuperación.'}
          {step === 2 && 'Ingresa el código de 6 dígitos enviado a tu correo.'}
          {step === 3 && 'Crea una nueva contraseña segura.'}
          {step === 4 && 'Tu contraseña ha sido actualizada exitosamente.'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleRequestCode}>
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
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Enviar Código'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleVerifyCode}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Código de 6 dígitos</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-center tracking-[0.5em] text-lg font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Verificar Código'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}

      {step === 3 && (
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleResetPassword}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Restablecer Contraseña'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="flex flex-col items-center justify-center gap-4 mt-4 py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <Link
            href="/login"
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2"
          >
            Ir a Iniciar Sesión
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {step < 4 && (
        <div className="mt-6 text-center text-zinc-400">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
            Inicia sesión
          </Link>
        </div>
      )}
    </div>
  );
}
