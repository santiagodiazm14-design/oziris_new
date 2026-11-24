"use client";

import React from "react";
import { Check } from "lucide-react";

export const PAYMENT_STEPS = [
  "Resumen y método",
  "Datos de pago",
  "Procesando",
  "Confirmación",
] as const;

interface PaymentStepperProps {
  /** Paso actual, de 1 a 4. */
  current: 1 | 2 | 3 | 4;
}

/** Barra de progreso de la pasarela de pago. */
export default function PaymentStepper({ current }: PaymentStepperProps) {
  return (
    <ol
      aria-label="Progreso del pago"
      className="flex items-center justify-center gap-2 sm:gap-4 mb-10"
    >
      {PAYMENT_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                  done
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : active
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-white/5 border-white/10 text-zinc-500"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </span>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  active ? "text-white" : done ? "text-emerald-300" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            </div>
            {n < PAYMENT_STEPS.length && (
              <span
                className={`w-6 sm:w-12 h-px ${done ? "bg-emerald-500" : "bg-white/10"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
