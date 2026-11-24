"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import {
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_MS,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_KEY,
} from "@/lib/session";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "wheel", "scroll", "touchstart", "click"] as const;
const TICK_MS = 1000;

const readLast = (): number => {
  try {
    const v = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
};

/**
 * Cierra la sesion si el usuario esta inactivo (sin tocar el mouse, teclado
 * o pantalla). Avisa el ultimo minuto con la opcion de seguir conectado. La
 * ultima actividad se guarda en localStorage, asi que vale para todas las
 * pestanas y tambien si el navegador estuvo cerrado mucho tiempo. Mientras
 * suena un beat no se considera inactividad.
 */
export default function IdleSessionGuard() {
  const { isAuthenticated, logout } = useAuth();
  const { isPlaying } = usePlayer();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const playingRef = useRef(isPlaying);
  const logoutRef = useRef(logout);
  const lastTouchRef = useRef(0);
  // Evita cerrar la sesion dos veces entre un tick y el cambio de estado
  const expiredRef = useRef(false);

  useEffect(() => {
    playingRef.current = isPlaying;
    logoutRef.current = logout;
  });

  const touch = useCallback((force = false) => {
    const now = Date.now();
    // Se escribe como mucho una vez por segundo
    if (!force && now - lastTouchRef.current < TICK_MS) return;
    lastTouchRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    } catch {
      /* sin almacenamiento: se sigue sin control compartido */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    expiredRef.current = false;
    const expire = () => {
      if (expiredRef.current) return;
      expiredRef.current = true;
      try {
        sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
      } catch {
        /* ignorar */
      }
      setSecondsLeft(null);
      logoutRef.current();
    };

    // Si el navegador estuvo cerrado/dormido mas del limite, la sesion ya caduco
    const stored = readLast();
    if (stored && Date.now() - stored >= IDLE_TIMEOUT_MS) {
      expire();
      return;
    }
    touch(true);

    const onActivity = () => {
      touch();
      setSecondsLeft(null);
    };
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const timer = setInterval(() => {
      if (playingRef.current) touch();
      const last = readLast() || Date.now();
      const idle = Date.now() - last;
      if (idle >= IDLE_TIMEOUT_MS) {
        expire();
      } else if (idle >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        setSecondsLeft(Math.max(1, Math.ceil((IDLE_TIMEOUT_MS - idle) / 1000)));
      } else {
        setSecondsLeft(null);
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [isAuthenticated, touch]);

  if (!isAuthenticated || secondsLeft === null) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm bg-[#0f151c] border border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-400" />
        </div>
        <h2 id="idle-title" className="text-lg font-bold text-white mb-2">
          ¿Sigues ahí?
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          Por seguridad, tu sesión se cerrará por inactividad en{" "}
          <span className="font-bold text-amber-300">{secondsLeft} s</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            touch(true);
            setSecondsLeft(null);
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold cursor-pointer"
        >
          Seguir conectado
        </button>
      </div>
    </div>
  );
}
