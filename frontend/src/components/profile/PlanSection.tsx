"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cancelSubscriptionApi, fetchMySubscriptionApi } from "@/services/api";
import type { MySubscription } from "@/types";
import { formatCop } from "@/lib/checkoutParams";

interface PlanSectionProps {
  onNotify?: (type: "success" | "error", message: string) => void;
}

/** Plan actual del artista, su cupo de beats y la opcion de cancelar. */
export default function PlanSection({ onNotify }: PlanSectionProps) {
  const { token } = useAuth();
  const [mine, setMine] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await fetchMySubscriptionApi(token);
    setMine(data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del plan desde la API
    load();
  }, [load]);

  const cancel = async () => {
    if (!token) return;
    try {
      setCancelling(true);
      const res = await cancelSubscriptionApi(token);
      onNotify?.("success", res.message);
      setConfirming(false);
      await load();
    } catch (err) {
      onNotify?.("error", (err as Error)?.message || "No fue posible cancelar la suscripción.");
    } finally {
      setCancelling(false);
    }
  };

  const used = mine?.beatsUsed ?? 0;
  const max = mine?.maxBeats ?? null;
  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return (
    <section className="bg-[#0c1217] border border-emerald-500/10 rounded-3xl p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="text-base font-bold text-white">Mi plan</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tu suscripción y cuántos beats puedes publicar.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu plan...
        </div>
      ) : !mine ? (
        <p className="text-sm text-zinc-400">No pudimos cargar tu plan en este momento.</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-white">Plan {mine.planName}</p>
                <p className="text-xs text-zinc-400">
                  {mine.status === "ACTIVE" && mine.endsAt
                    ? `${mine.period === "YEARLY" ? "Anual" : "Mensual"} · ${formatCop(mine.amount)} · vence el ${new Date(mine.endsAt).toLocaleDateString("es-CO")}`
                    : "Plan gratuito"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400">Beats publicados</span>
              <span className="font-semibold text-white">
                {used} {max === null ? "· ilimitados" : `de ${max}`}
              </span>
            </div>
            {max !== null && (
              <div
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={max}
                className="h-2 rounded-full bg-white/10 overflow-hidden"
              >
                <div
                  className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            {max !== null && mine.beatsRemaining === 0 && (
              <p className="text-xs text-red-300 mt-2">
                Llegaste al límite de tu plan. Mejora tu plan para subir más beats.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/planes"
              className="flex-1 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm"
            >
              {mine.plan === "PREMIUM" ? "Ver planes" : "Mejorar plan"}
            </Link>
            {mine.status === "ACTIVE" &&
              (confirming ? (
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={cancel}
                    disabled={cancelling}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 font-bold text-sm hover:bg-red-500/30 disabled:opacity-60 cursor-pointer"
                  >
                    {cancelling ? "Cancelando..." : "Sí, cancelar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={cancelling}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 cursor-pointer"
                >
                  Cancelar suscripción
                </button>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
