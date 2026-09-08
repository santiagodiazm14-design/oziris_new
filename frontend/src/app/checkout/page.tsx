"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Loader2,
  Music2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchTrackById, Track } from "@/services/api";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const beatId = searchParams.get("beat");

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PSE");

  useEffect(() => {
    async function loadTrack() {
      if (!beatId) {
        setError("No se encontró el Beat seleccionado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await fetchTrackById(beatId);
        setTrack(data);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar la información del Beat.");
      } finally {
        setLoading(false);
      }
    }

    loadTrack();
  }, [beatId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // IR A LA PÁGINA DE DATOS DE PAGO AL HACER CLIC EN EL BOTÓN PRINCIPAL
  const irADatosPago = () => {
    if (!beatId || !paymentMethod) return;

    router.push(
      `/datos-pago?metodo=${encodeURIComponent(paymentMethod)}&beat=${encodeURIComponent(beatId)}`
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">

          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />

          <p className="text-zinc-400">
            Cargando información del Beat...
          </p>

        </div>
      </main>
    );
  }

  if (error || !track) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">

        <div className="text-center max-w-md">

          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">

            <Music2 className="w-8 h-8 text-red-400" />

          </div>

          <h1 className="text-2xl font-bold mb-3">
            No se pudo cargar el Beat
          </h1>

          <p className="text-zinc-400 mb-7">
            {error || "El Beat seleccionado no existe."}
          </p>

          <Link
            href="/inicio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-5 py-3 rounded-xl font-semibold transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al catálogo
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <Link
            href="/inicio"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Beats</span>
          </Link>

          <div className="flex items-center gap-2">

            <ShoppingBag className="w-5 h-5 text-purple-400" />

            <span className="text-xl font-bold tracking-[0.25em]">

              O<span className="text-purple-500">Z</span>IRIS

            </span>

          </div>

        </div>

      </header>

      {/* CONTENIDO */}
      <section className="max-w-6xl mx-auto px-4 py-12">

        {/* TITULO */}
        <div className="text-center mb-10">

          <span className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-5">

            <ShieldCheck className="w-4 h-4" />

            Compra segura

          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">

            Finalizar compra

          </h1>

          <p className="text-zinc-400 max-w-xl mx-auto">

            Revisa tu Beat y selecciona el método de pago que deseas utilizar.

          </p>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RESUMEN */}
          <div className="lg:col-span-1">

            <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 sticky top-24">

              {/* PORTADA */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-purple-500/20 mb-6">

                {track.coverUrl ? (

                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center">

                    <Music2 className="w-16 h-16 text-purple-400" />

                  </div>

                )}

              </div>

              {/* INFORMACIÓN */}
              <div className="mb-6">

                <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold">

                  Beat seleccionado

                </p>

                <h2 className="text-2xl font-bold mt-2 break-words">

                  {track.title}

                </h2>

                {track.producer?.name && (

                  <p className="text-sm text-zinc-400 mt-2">

                    Producido por{" "}

                    <span className="text-white">

                      {track.producer.name}

                    </span>

                  </p>

                )}

                {track.genre && (

                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">

                    {track.genre}

                  </span>

                )}

              </div>

              {/* PRECIO */}
              <div className="border-t border-white/10 pt-5">

                <div className="flex items-center justify-between mb-3">

                  <span className="text-zinc-400">
                    Precio del Beat
                  </span>

                  <span className="font-semibold">
                    {formatPrice(track.price)}
                  </span>

                </div>

                <div className="flex items-center justify-between mb-3">

                  <span className="text-zinc-400">
                    Comisión
                  </span>

                  <span className="text-emerald-400">
                    $0
                  </span>

                </div>

                <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">

                  <span className="font-bold text-lg">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-emerald-400">

                    {formatPrice(track.price)}

                  </span>

                </div>

              </div>

              {/* SEGURIDAD */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">

                <div className="flex gap-3">

                  <Lock className="w-5 h-5 text-emerald-400 shrink-0" />

                  <div>

                    <p className="text-sm font-semibold text-emerald-400">

                      Pago protegido

                    </p>

                    <p className="text-xs text-zinc-500 mt-1">

                      Tu información de pago será procesada de forma segura.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* FORMAS DE PAGO */}
          <div className="lg:col-span-2">

            <div className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8">

              <h2 className="text-2xl font-bold mb-2">

                Selecciona tu forma de pago

              </h2>

              <p className="text-sm text-zinc-400 mb-7">

                Selecciona el método que deseas utilizar para continuar.

              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* PSE */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PSE")}
                  className={`group text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === "PSE"
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20"
                      : "bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">

                      <Building2 className="w-6 h-6 text-blue-400" />

                    </div>

                    <div>

                      <h3 className="font-bold text-lg">
                        PSE
                      </h3>

                      <p className="text-xs text-zinc-400 mt-1">
                        Débito desde tu cuenta bancaria
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold">

                    {paymentMethod === "PSE" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border border-zinc-600 group-hover:border-purple-400 transition" />
                        <span className="text-zinc-400 group-hover:text-zinc-200">Seleccionar PSE</span>
                      </>
                    )}

                  </div>

                </button>

                {/* TARJETA */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Tarjeta")}
                  className={`group text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    paymentMethod === "Tarjeta"
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20"
                      : "bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5"
                  }`}
                >

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">

                      <CreditCard className="w-6 h-6 text-purple-400" />

                    </div>

                    <div>

                      <h3 className="font-bold text-lg">
                        Tarjeta
                      </h3>

                      <p className="text-xs text-zinc-400 mt-1">
                        Tarjeta de crédito o débito
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold">

                    {paymentMethod === "Tarjeta" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border border-zinc-600 group-hover:border-purple-400 transition" />
                        <span className="text-zinc-400 group-hover:text-zinc-200">Seleccionar Tarjeta</span>
                      </>
                    )}

                  </div>

                </button>

              </div>

              {/* MÉTODO SELECCIONADO */}
              <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">

                <div>
                  <p className="text-xs text-zinc-400">
                    Método de pago seleccionado
                  </p>
                  <p className="text-lg font-bold text-purple-400 mt-0.5">
                    {paymentMethod}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                  Listo para continuar
                </span>

              </div>

              {/* BOTÓN CONTINUAR */}
              <div className="mt-8">

                <button
                  type="button"
                  onClick={irADatosPago}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition transform hover:scale-[1.01] cursor-pointer"
                >

                  <Lock className="w-5 h-5" />

                  Continuar con {paymentMethod}

                </button>

              </div>

              <div className="mt-5 text-center">

                <p className="text-xs text-zinc-500">

                  Al continuar con el pago aceptas los términos y condiciones
                  de compra de OZIRIS.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Cargando información del Beat...</p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}