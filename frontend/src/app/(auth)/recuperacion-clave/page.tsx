"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Hash, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff, RotateCw } from 'lucide-react';
import { forgotPasswordApi, verifyResetCodeApi, resetPasswordApi } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resending code
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const res = await forgotPasswordApi(cleanEmail);
      setInfoMessage(res.message || 'Código enviado a tu correo.');
      setCooldown(30);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar el código de recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await forgotPasswordApi(email.trim());
      setInfoMessage('Se ha enviado un nuevo código a tu correo.');
      setCooldown(30);
    } catch (err: any) {
      setError(err.message || 'No se pudo reenviar el código. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('El código debe contener 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyResetCodeApi(email.trim(), cleanCode);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Código incorrecto o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPasswordApi(email.trim(), code.trim(), newPassword);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña.');
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
        <p className="text-zinc-400 text-sm">
          {step === 1 && 'Ingresa tu correo para recibir un código de recuperación de 6 dígitos.'}
          {step === 2 && (
            <span>
              Ingresa el código enviado a <strong className="text-emerald-300">{email}</strong>.
            </span>
          )}
          {step === 3 && 'Crea una nueva contraseña segura para tu cuenta de Oziris.'}
          {step === 4 && 'Tu contraseña ha sido actualizada exitosamente.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
          {error}
        </div>
      )}

      {infoMessage && step === 2 && !error && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-in fade-in">
          {infoMessage}
        </div>
      )}

      {/* PASO 1: SOLICITAR CÓDIGO */}
      {step === 1 && (
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleRequestCode}>
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
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>Enviando código...</span>
              </>
            ) : (
              <>
                <span>Enviar Código</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* PASO 2: VERIFICAR CÓDIGO */}
      {step === 2 && (
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleVerifyCode}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Código de 6 dígitos</label>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Cambiar correo
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-center tracking-[0.5em] text-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>¿No recibiste el correo?</span>
            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={handleResendCode}
              className="text-emerald-400 hover:text-emerald-300 disabled:text-zinc-600 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed font-medium"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Verificar Código</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* PASO 3: NUEVA CONTRASEÑA */}
      {step === 3 && (
        <form className="flex flex-col gap-4 mt-2" onSubmit={handleResetPassword}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>Restableciendo contraseña...</span>
              </>
            ) : (
              <>
                <span>Restablecer Contraseña</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* PASO 4: ÉXITO */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center gap-4 mt-4 py-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">¡Contraseña restablecida!</h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Ahora puedes iniciar sesión en OZIRIS con tu nueva contraseña.
            </p>
          </div>
          <Link
            href="/login"
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mt-4"
          >
            Iniciar Sesión
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {step < 4 && (
        <div className="mt-4 text-center text-sm text-zinc-400">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Inicia sesión
          </Link>
        </div>
      )}
    </div>
  );
}
