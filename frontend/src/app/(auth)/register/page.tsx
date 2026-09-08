// Habilita la interactividad del lado del cliente en Next.js App Router
"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react'; // Iconos vectoriales
import { useRouter } from 'next/navigation'; // Hook para cambiar de ruta programáticamente

export default function RegisterPage() {
  // Inicializa el enrutador
  const router = useRouter();

  // Función que maneja el envío del formulario de registro
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); // Previene que la página se refresque
    // Simulamos un registro exitoso y enviamos al usuario directamente a inicio
    router.push('/inicio');
  };
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Únete a Oziris</h2>
        <p className="text-zinc-400">Crea tu cuenta y empieza a compartir tu sonido.</p>
      </div>

      {/* Formulario vinculado a nuestra función handleRegister */}
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleRegister}>
        {/* Campo de Nombre de Usuario */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Nombre de Usuario</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="ProductorXYZ"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="email"
              placeholder="tu@correo.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="password"
              placeholder="Crea una contraseña segura"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botón de Creación de Cuenta con animación de icono y sombra vibrante */}
        <button
          type="submit"
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2"
        >
          Crear Cuenta
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="mt-6 text-center text-zinc-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
