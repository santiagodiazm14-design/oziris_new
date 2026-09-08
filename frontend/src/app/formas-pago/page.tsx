"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function FormasPagoPage() {
  const paymentMethods = [
    {
      title: "PSE",
      description:
        "Realiza tu pago directamente desde tu cuenta bancaria a través de PSE.",
      icon: <Building2 className="w-8 h-8" />,
    },
    {
      title: "Tarjetas (Crédito y Débito)",
      description:
        "Paga de forma rápida y segura con tus tarjetas Visa, Mastercard o cualquier franquicia.",
      icon: <CreditCard className="w-8 h-8" />,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/inicio"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Beats</span>
          </Link>

          <div className="text-xl font-bold tracking-[0.35em]">
            O<span className="text-purple-500">Z</span>IRIS
          </div>
        </div>
      </header>

      {/* Contenido */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <ShieldCheck className="w-4 h-4" />
            Pagos seguros
          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Formas de pago
          </h1>

          <p className="text-zinc-400 text-base md:text-lg">
            Aceptamos los métodos de pago más confiables y seguros para que obtengas tus Beats al instante.
          </p>
        </div>

        {/* Métodos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {paymentMethods.map((method) => (
            <div
              key={method.title}
              className="group bg-[#121216] border border-white/10 hover:border-purple-500/40 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition">
                {method.icon}
              </div>

              <h2 className="text-xl font-bold mb-3">
                {method.title}
              </h2>

              <p className="text-sm text-zinc-400 leading-6">
                {method.description}
              </p>

              <div className="flex items-center gap-2 mt-6 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Disponible
              </div>
            </div>
          ))}
        </div>

        {/* Seguridad */}
        <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <h3 className="font-bold text-white mb-1">
              Compra de forma segura
            </h3>

            <p className="text-sm text-zinc-400">
              Tus datos de pago deben procesarse mediante una plataforma
              especializada y segura. Oziris no almacena los datos completos
              de tus tarjetas.
            </p>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-center mt-10">
          <Link
            href="/inicio"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition transform hover:scale-105"
          >
            Explorar Beats
          </Link>
        </div>
      </section>
    </main>
  );
}