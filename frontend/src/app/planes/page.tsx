"use client";

import React, { useEffect, useState } from "react";
import { Check, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchPlansApi, fetchMySubscriptionApi } from "@/services/api";
import type { MySubscription, PlanInfo } from "@/types";
import { formatCop, planCheckoutUrl } from "@/lib/checkoutParams";

// Se usa solo si la API no responde; el precio real siempre lo cobra el servidor.
const FALLBACK_PLANS: PlanInfo[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Disfruta limitadamente",
    priceMonthly: 0,
    priceYearly: 0,
    maxBeats: 10,
    features: ["Subir hasta 10 beats", "Licencia estándar", "0% de comisión por beat", "Uso no exclusivo"],
  },
  {
    id: "PLUS",
    name: "Plus",
    description: "Beneficios exclusivos",
    priceMonthly: 25000,
    priceYearly: 250000,
    maxBeats: 100,
    features: [
      "Subir hasta 100 beats",
      "Perfil mejorado (banners, links, redes)",
      "15% de comisión en ventas",
      "Acceso limitado a licencias exclusivas",
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Disfruta a tu estilo",
    priceMonthly: 50000,
    priceYearly: 600000,
    maxBeats: null,
    features: ["Beats ilimitados", "Perfil avanzado", "50% de comisión en ventas", "Licencias exclusivas y personalizadas"],
  },
];

type Period = "MONTHLY" | "YEARLY";

export default function PricingPage() {
  const router = useRouter();
  const { token, isAuthenticated, isAdmin } = useAuth();
  const [plans, setPlans] = useState<PlanInfo[]>(FALLBACK_PLANS);
  const [period, setPeriod] = useState<Period>("YEARLY");
  const [mine, setMine] = useState<MySubscription | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlansApi()
      .then((p) => {
        if (!cancelled && p.length > 0) setPlans(p);
      })
      .catch(() => {
        /* se queda con el catalogo local */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin sesion no hay plan propio
      setMine(null);
      return;
    }
    fetchMySubscriptionApi(token).then((m) => {
      if (!cancelled) setMine(m);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isCurrent = (plan: PlanInfo) =>
    !!mine && mine.plan === plan.id && (plan.id === "FREE" || mine.period === period);

  const subscribe = (plan: PlanInfo) => {
    if (plan.id === "FREE") {
      router.push(isAuthenticated ? "/inicio" : "/register");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(planCheckoutUrl(plan.id as "PLUS" | "PREMIUM", period));
  };

  const buttonLabel = (plan: PlanInfo) => {
    if (isCurrent(plan)) return "Tu plan actual";
    if (plan.id === "FREE") return isAuthenticated ? "Seguir con Free" : "Crear cuenta gratis";
    if (!isAuthenticated) return "Inicia sesión para suscribirte";
    return "Suscríbete ahora";
  };

  return (
    <div className="min-h-screen bg-[#090d10] text-white py-20 px-4 flex flex-col items-center relative overflow-hidden">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => router.push("/inicio")}
        className="absolute top-8 left-8 md:top-12 md:left-12 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-20 cursor-pointer"
      >
        <X className="w-6 h-6 text-zinc-400" />
      </button>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Elige tu plan</h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Únete a nuestra comunidad y potencia tu carrera musical con las mejores herramientas del mercado.
          </p>
        </div>

        <div
          role="group"
          aria-label="Periodo de facturación"
          className="mb-12 inline-flex rounded-full bg-white/5 border border-white/10 p-1"
        >
          {(["MONTHLY", "YEARLY"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                period === p ? "bg-emerald-500 text-slate-950" : "text-zinc-400 hover:text-white"
              }`}
            >
              {p === "MONTHLY" ? "Mensual" : "Anual"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {plans.map((plan, index) => {
            const highlighted = plan.id === "PLUS";
            const current = isCurrent(plan);
            const price = period === "YEARLY" ? plan.priceYearly : plan.priceMonthly;
            const disabled = current || (isAdmin && plan.id !== "FREE");
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 ${
                  highlighted
                    ? "bg-gradient-to-b from-emerald-950/30 to-teal-950/20 border border-emerald-500/40 shadow-2xl shadow-emerald-500/15"
                    : "bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 backdrop-blur-sm"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold px-4 py-1 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 fill-slate-950" /> MÁS POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">{plan.name}</h3>
                  <p className="text-zinc-400 text-sm h-5">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-bold tracking-tighter">{formatCop(price)}</span>
                    <span className="text-zinc-400 font-medium">/ {period === "YEARLY" ? "año" : "mes"}</span>
                  </div>
                  {plan.id !== "FREE" && (
                    <div className="text-sm font-medium text-emerald-400">
                      {period === "YEARLY"
                        ? `Mes por tan solo ${formatCop(plan.priceMonthly)}`
                        : `Ahorra pagando al año: ${formatCop(plan.priceYearly)}`}
                    </div>
                  )}
                </div>

                <div className="h-[1px] w-full bg-white/10 mb-8" />

                <div className="flex-grow">
                  <h4 className="text-lg font-semibold mb-6">Beneficios</h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                        <div className="mt-0.5 bg-emerald-500/20 p-1 rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-4">
                  <button
                    type="button"
                    onClick={() => subscribe(plan)}
                    disabled={disabled}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      highlighted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/5"
                    }`}
                  >
                    {buttonLabel(plan)}
                  </button>
                  <p className="text-center text-xs font-medium text-zinc-500 mt-4 uppercase tracking-wider">
                    {plan.id === "FREE" ? "Sin costo" : "Pago simulado · Cancela cuando quieras"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <p className="mt-8 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            El rol Administrador no necesita un plan.
          </p>
        )}
      </div>
    </div>
  );
}
