"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Loader2,
  Music2,
  Crown,
  Check,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchTrackById, fetchPlansApi, Track } from "@/services/api";
import type { PlanInfo } from "@/types";
import { useAuth } from "@/context/AuthContext";
import PaymentStepper from "@/components/checkout/PaymentStepper";
import { formatCop, parseCheckoutTarget } from "@/lib/checkoutParams";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getImageUrl(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

const PAYMENT_OPTIONS = [
  { id: "PSE", label: "PSE", hint: "Débito desde tu cuenta bancaria", Icon: Building2, tone: "teal" },
  { id: "Tarjeta", label: "Tarjeta", hint: "Tarjeta de crédito o débito", Icon: CreditCard, tone: "emerald" },
] as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  const target = useMemo(() => parseCheckoutTarget(searchParams), [searchParams]);
  const targetKey = JSON.stringify(target);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PSE");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const t = JSON.parse(targetKey) as ReturnType<typeof parseCheckoutTarget>;
      setLoading(true);
      setError("");
      try {
        if (t.kind === "beats") {
          const found = await Promise.all(t.ids.map((id) => fetchTrackById(id)));
          if (!cancelled) setTracks(found);
        } else if (t.kind === "plan") {
          const plans = await fetchPlansApi();
          const p = plans.find((x) => x.id === t.plan) || null;
          if (!p) throw new Error("Plan no encontrado.");
          if (!cancelled) setPlan(p);
        } else {
          throw new Error("No se encontró nada para pagar.");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("No fue posible cargar la información de tu compra.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [targetKey]);

  const planTotal =
    plan && target.kind === "plan"
      ? target.period === "YEARLY"
        ? plan.priceYearly
        : plan.priceMonthly
      : 0;
  const total = target.kind === "plan" ? planTotal : tracks.reduce((s, t) => s + (t.price || 0), 0);

  const canContinue = isAuthenticated && !isAdmin;

  const continuar = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAdmin || target.kind === "none") return;
    const base = `/datos-pago?metodo=${encodeURIComponent(paymentMethod)}`;
    if (target.kind === "plan") {
      router.push(`${base}&plan=${target.plan}&periodo=${target.period}`);
    } else {
      router.push(`${base}&beats=${target.ids.map(encodeURIComponent).join(",")}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Cargando tu compra...</p>
        </div>
      </main>
    );
  }

  if (error || (target.kind === "beats" && tracks.length === 0) || (target.kind === "plan" && !plan)) {
    return (
      <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Music2 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">No se pudo cargar tu compra</h1>
          <p className="text-zinc-400 mb-7">{error || "Lo que intentas pagar no existe."}</p>
          <Link
            href="/inicio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 px-5 py-3 rounded-xl font-bold transition shadow-md shadow-emerald-500/20"
          >
            <ArrowLeft className="w-5 h-5 text-slate-950" />
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const isPlan = target.kind === "plan";

  return (
    <main className="min-h-screen bg-[#090d10] text-white font-sans">
      <header className="border-b border-emerald-500/15 bg-[#090d10]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={isPlan ? "/planes" : "/inicio"}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isPlan ? "Volver a planes" : "Volver a Beats"}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-bold tracking-[0.25em]">
              O<span className="text-emerald-400">Z</span>IRIS
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <PaymentStepper current={1} />

        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <ShieldCheck className="w-4 h-4" />
            {isPlan ? "Suscripción segura" : "Compra segura"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {isPlan ? "Confirma tu plan" : "Finalizar compra"}
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            {isPlan
              ? "Revisa tu plan y selecciona el método de pago que deseas utilizar."
              : tracks.length > 1
                ? "Revisa tus Beats y selecciona el método de pago que deseas utilizar."
                : "Revisa tu Beat y selecciona el método de pago que deseas utilizar."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f151c] border border-white/10 rounded-2xl p-6 lg:sticky lg:top-24">
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-4">
                {isPlan ? "Plan seleccionado" : tracks.length > 1 ? `${tracks.length} Beats seleccionados` : "Beat seleccionado"}
              </p>

              {isPlan && plan && target.kind === "plan" ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{plan.name}</h2>
                      <p className="text-xs text-zinc-400">
                        Facturación {target.period === "YEARLY" ? "anual" : "mensual"}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {tracks.map((track) => {
                    const cover = getImageUrl(track.coverUrl);
                    return (
                      <li key={track.id} className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#122421] to-[#0c181f] border border-emerald-500/20 shrink-0">
                          {cover ? (
                            <Image src={cover} alt={track.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-emerald-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="font-bold truncate">{track.title}</h2>
                          <p className="text-xs text-zinc-400 truncate">
                            {track.producer?.artistName || track.producer?.name || "Productor"}
                            {track.genre ? ` · ${track.genre}` : ""}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-400 shrink-0">
                          {formatCop(track.price)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400">{isPlan ? "Precio del plan" : "Subtotal"}</span>
                  <span className="font-semibold">{formatCop(total)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400">Comisión</span>
                  <span className="text-emerald-400">$0</span>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">{formatCop(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Pago protegido</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Tu información de pago será procesada de forma segura.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMAS DE PAGO */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f151c] border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2">Selecciona tu forma de pago</h2>
              <p className="text-sm text-zinc-400 mb-7">
                Selecciona el método que deseas utilizar para continuar.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {PAYMENT_OPTIONS.map(({ id, label, hint, Icon, tone }) => {
                  const selected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      aria-pressed={selected}
                      className={`group text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        selected
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                          : "bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                            tone === "teal"
                              ? "bg-teal-500/10 border-teal-500/20"
                              : "bg-emerald-500/10 border-emerald-500/20"
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${tone === "teal" ? "text-teal-400" : "text-emerald-400"}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{label}</h3>
                          <p className="text-xs text-zinc-400 mt-1">{hint}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-5 text-xs font-semibold">
                        {selected ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Seleccionado</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full border border-zinc-600 group-hover:border-emerald-400 transition" />
                            <span className="text-zinc-400 group-hover:text-zinc-200">Seleccionar {label}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">Método de pago seleccionado</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{paymentMethod}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                  Listo para continuar
                </span>
              </div>

              {isAdmin && (
                <p className="mt-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  El rol Administrador no puede realizar pagos. Usa una cuenta de usuario normal.
                </p>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={continuar}
                  disabled={isAdmin}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5 text-slate-950" />
                  {canContinue || isAdmin ? `Continuar con ${paymentMethod}` : "Inicia sesión para continuar"}
                </button>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-zinc-500">
                  Al continuar con el pago aceptas los términos y condiciones de compra de OZIRIS.
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
        <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Cargando tu compra...</p>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
