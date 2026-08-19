// Indicamos que este componente se ejecuta en el cliente (navegador) para poder usar hooks y manejar eventos
"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react'; // Iconos de la interfaz
import { useRouter } from 'next/navigation'; // Hook para la navegación entre páginas

export default function LoginPage() {
  // Inicializamos el enrutador para poder cambiar de página mediante código
  const router = useRouter();

  // Función que se ejecuta al enviar el formulario (onSubmit)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento por defecto)
    // Redirige al usuario a la vista de planes después de un "login exitoso"
    router.push('/planes');
  };
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Bienvenido de vuelta</h2>
        <p className="text-zinc-400">Ingresa a tu cuenta para continuar creando.</p>
      </div>

      {/* Enlazamos la función handleLogin al evento onSubmit del formulario */}
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>
        {/* Campo de Correo Electrónico */}
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

        {/* Campo de Contraseña */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Contraseña</label>
            <Link href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botón de envío principal */}
        <button
          type="submit"
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 mt-2"
        >
          Iniciar Sesión
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="mt-6 text-center text-zinc-400">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
          Regístrate
        </Link>
      </div>
    </div>
  );
}
