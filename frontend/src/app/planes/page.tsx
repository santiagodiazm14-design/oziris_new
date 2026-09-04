// Indicamos que es un "Client Component" para poder tener estado y eventos en Next.js App Router
"use client";

import React from 'react';
import { Check, Star, X } from 'lucide-react'; // Iconos de palomita y estrella
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  // Arreglo de objetos con la información de cada membresía (Tiers de pago)
  const plans = [
    {
      name: "Free",
      description: "Disfruta limitadamente",
      priceYear: "$0.00",
      priceMonth: "$0.00",
      features: [
        "Subir hasta 10 beats",
        "Licencia estándar",
        "0% de comisión por beat",
        "Uso no exclusivo"
      ],
      highlighted: false,
    },
    {
      name: "Plus",
      description: "Beneficios exclusivos",
      priceYear: "$250.000",
      priceMonth: "$25.000",
      features: [
        "Subir hasta 100 beats",
        "Perfil mejorado (banners, links, redes)",
        "15% de comisión en ventas",
        "Acceso limitado a licencias exclusivas"
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      description: "Disfruta a tu estilo",
      priceYear: "$600.000",
      priceMonth: "$50.000",
      features: [
        "Beats ilimitados",
        "Perfil avanzado",
        "50% de comisión en ventas",
        "Licencias exclusivas y personalizadas"
      ],
      highlighted: false,
    }
  ];

  return (
    // Contenedor principal: min-h-screen para cubrir toda la pantalla, con fondo oscuro
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4 flex flex-col items-center relative overflow-hidden">
      <button 
        onClick={() => router.push('/inicio')}
        className="absolute top-8 left-8 md:top-12 md:left-12 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-20"
      >
        <X className="w-6 h-6 text-zinc-400" />
      </button>

      {/* Background Glow Decorators: Círculos con desenfoque extremo para dar efecto glassmorphism premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Elige tu plan</h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Únete a nuestra comunidad y potencia tu carrera musical con las mejores herramientas del mercado.
          </p>
        </div>

        {/* Grid para acomodar las tarjetas: 1 columna en móvil, 3 columnas en pantallas medianas/grandes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Iteramos sobre nuestra constante `plans` para renderizar cada tarjeta dinámicamente */}
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-purple-900/20 to-blue-900/10 border border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                  : 'bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 backdrop-blur-sm'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-white" /> MÁS POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-2 tracking-tight">{plan.name}</h3>
                <p className="text-zinc-400 text-sm h-5">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl md:text-5xl font-bold tracking-tighter">{plan.priceYear}</span>
                  <span className="text-zinc-400 font-medium">/ año</span>
                </div>
                <div className="text-sm font-medium text-purple-400/80">
                  Mes por tan solo {plan.priceMonth}
                </div>
              </div>

              <div className="h-[1px] w-full bg-white/10 mb-8" />

              <div className="flex-grow">
                {/* Lista de beneficios iterada dinámicamente para cada plan */}
                <h4 className="text-lg font-semibold mb-6">Beneficios</h4>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="mt-0.5 bg-purple-500/20 p-1 rounded-full shrink-0">
                        <Check className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-4">
                <button
                  className={`w-full py-3.5 rounded-xl font-medium transition-all active:scale-[0.98] ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'
                  }`}
                >
                  Suscribete ahora
                </button>
                <p className="text-center text-xs font-medium text-zinc-500 mt-4 uppercase tracking-wider">
                  Comienza la prueba de 7 dias
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
