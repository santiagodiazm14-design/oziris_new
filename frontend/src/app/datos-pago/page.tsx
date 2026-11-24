"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Building2,
  ShieldCheck,
  Lock,
  ShoppingBag,
  CheckCircle2,
  Download,
  Loader2,
  AlertTriangle,
  Crown,
  Music2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import {
  simulatePaymentApi,
  simulateSubscriptionApi,
  downloadBeatFile,
  fetchTrackById,
  fetchPlansApi,
  Track,
} from "@/services/api";
import type { PaymentSimulationResponse, PlanInfo, SubscriptionSimulationResponse } from "@/types";
import PaymentStepper from "@/components/checkout/PaymentStepper";
import { formatCop, parseCheckoutTarget, beatsCheckoutUrl, planCheckoutUrl } from "@/lib/checkoutParams";

const PROCESSING_STEPS = [
  "Validando tus datos",
  "Autorizando el pago con tu banco",
  "Generando tu licencia",
];
const STEP_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function DatosPagoContent() {
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { removeFromCart } = useCart();
  const { showToast } = useToast();

  const metodo = searchParams.get("metodo") || "PSE";
  const target = useMemo(() => parseCheckoutTarget(searchParams), [searchParams]);
  const targetKey = JSON.stringify(target);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [formData, setFormData] = useState({
    nombre: user?.name || "",
    documento: "",
    correo: user?.email || "",
    telefono: "",
    banco: "Bancolombia",
    tipoPersona: "Persona natural",
    celularNequi: "",
    titularTarjeta: user?.name || "",
    numeroTarjeta: "",
    vencimiento: "",
    cvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIdx, setProcessingIdx] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<PaymentSimulationResponse | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionSimulationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prellena el formulario cuando el usuario termina de cargar (ajuste durante el render).
  const [prefilledUser, setPrefilledUser] = useState(user);
  if (user !== prefilledUser) {
    setPrefilledUser(user);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: prev.nombre || user.name || "",
        correo: prev.correo || user.email || "",
        titularTarjeta: prev.titularTarjeta || user.name || "",
      }));
    }
  }

  // Carga lo que se esta pagando (beats o plan)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const t = JSON.parse(targetKey) as ReturnType<typeof parseCheckoutTarget>;
      try {
        if (t.kind === "beats") {
          const found = await Promise.all(t.ids.map((id) => fetchTrackById(id)));
          if (!cancelled) setTracks(found);
        } else if (t.kind === "plan") {
          const plans = await fetchPlansApi();
          if (!cancelled) setPlan(plans.find((p) => p.id === t.plan) || null);
        }
      } catch {
        if (!cancelled) setErrorMsg("No fue posible cargar los datos de tu compra.");
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
  const backUrl =
    target.kind === "plan"
      ? planCheckoutUrl(target.plan, target.period)
      : target.kind === "beats"
        ? beatsCheckoutUrl(target.ids)
        : "/inicio";

  const actualizarCampo = (campo: string, valor: string) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      setErrorMsg("Debes iniciar sesión para completar el pago.");
      return;
    }
    if (isAdmin) {
      setErrorMsg("El rol Administrador no puede realizar pagos.");
      return;
    }
    if (target.kind === "none") {
      setErrorMsg("No se especificó qué deseas pagar.");
      return;
    }

    const payer = {
      payerName: formData.nombre,
      payerEmail: formData.correo,
      payerPhone: formData.telefono,
      payerDocument: formData.documento,
    };
    const cardLastFour = formData.numeroTarjeta ? formData.numeroTarjeta.slice(-4) : undefined;

    try {
      setErrorMsg(null);
      setProcessingIdx(0);
      setIsProcessing(true);

      // La animacion de pasos corre mientras el servidor procesa el pago
      const animation = (async () => {
        for (let i = 1; i < PROCESSING_STEPS.length; i++) {
          await sleep(STEP_MS);
          setProcessingIdx(i);
        }
        await sleep(STEP_MS);
      })();

      if (target.kind === "plan") {
        const [res] = await Promise.all([
          simulateSubscriptionApi(token, {
            plan: target.plan,
            period: target.period,
            paymentMethod: metodo,
            ...payer,
            cardLastFour,
          }),
          animation,
        ]);
        setSubscriptionData(res);
      } else {
        const [res] = await Promise.all([
          simulatePaymentApi(token, {
            trackIds: target.ids,
            paymentMethod: metodo,
            licenseType: "ESTÁNDAR COMERCIAL (MP3 HQ)",
            ...payer,
            bankName: formData.banco,
            personType: formData.tipoPersona,
            cardHolder: formData.titularTarjeta,
            cardLastFour,
            phoneNumber: formData.celularNequi,
          }),
          animation,
        ]);
        setTransactionData(res);
        // Lo que ya se pago deja de estar en el carrito
        target.ids.forEach((id) => removeFromCart(id));
      }
    } catch (err) {
      setErrorMsg((err as Error)?.message || "Error al procesar el pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (trackId: string, title: string) => {
    if (!token) return;
    try {
      setDownloadingId(trackId);
      await downloadBeatFile(token, trackId, title || "Beat_Oziris");
    } catch (err) {
      showToast("error", (err as Error)?.message || "Error al descargar el archivo de audio.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getIcon = () => {
    if (metodo === "Tarjeta") {
      return <CreditCard className="w-6 h-6 text-emerald-400" />;
    }

    return <Building2 className="w-6 h-6 text-teal-400" />;
  };

  const getDescription = () => {
    if (metodo === "PSE") {
      return "Completa tus datos para continuar con el pago por PSE.";
    }

    return "Completa los datos de tu tarjeta para realizar el pago de forma segura.";
  };

  const done = !!transactionData || !!subscriptionData;
  const stepperCurrent = done ? 4 : isProcessing ? 3 : 2;

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Inicia sesión para pagar</h1>
          <p className="text-zinc-400 mb-6">Necesitas una cuenta para completar el pago.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 px-5 py-3 rounded-xl font-bold"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  if (target.kind === "none") {
    return (
      <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">No hay nada para pagar</h1>
          <p className="text-zinc-400 mb-6">Elige un beat o un plan para iniciar el proceso de pago.</p>
          <Link
            href="/inicio"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 px-5 py-3 rounded-xl font-bold"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d10] text-white font-sans">

      {/* HEADER */}
      <header className="border-b border-emerald-500/10 bg-[#090d10]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {done || isProcessing ? (
            <span />
          ) : (
            <Link
              href={backUrl}
              className="flex items-center gap-2 text-zinc-400 hover:text-emerald-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al pago</span>
            </Link>
          )}

          <div className="flex items-center gap-2">

            <ShoppingBag className="w-5 h-5 text-emerald-400" />

            <span className="text-xl font-bold tracking-[0.25em]">
              O<span className="text-emerald-400">Z</span>IRIS
            </span>

          </div>

        </div>
      </header>

      {/* CONTENIDO */}
      <section className="max-w-4xl mx-auto px-4 py-12">

        <PaymentStepper current={stepperCurrent} />

        {/* TITULO */}
        <div className="text-center mb-10">

          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-5">

            <ShieldCheck className="w-4 h-4 text-emerald-400" />

            Información de pago

          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {isProcessing ? "Procesando tu pago" : done ? "¡Pago completado!" : "Tus datos"}
          </h1>

          <p className="text-zinc-400 max-w-xl mx-auto">
            {getDescription()}
          </p>

        </div>

        {/* RESUMEN DE LO QUE SE PAGA */}
        {!done && (
        <div className="bg-[#0f151c] border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">
            {target.kind === "plan" ? "Tu plan" : tracks.length > 1 ? `Tus ${tracks.length} beats` : "Tu beat"}
          </p>
          {target.kind === "plan" ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">
                  {plan?.name || target.plan} · {target.period === "YEARLY" ? "anual" : "mensual"}
                </span>
              </div>
              <span className="font-bold text-emerald-400">{formatCop(planTotal)}</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {tracks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <Music2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </span>
                  <span className="text-zinc-300 shrink-0">{formatCop(t.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-bold">Total a pagar</span>
            <span className="text-xl font-bold text-emerald-400">{formatCop(total)}</span>
          </div>
        </div>
        )}

        {!isProcessing && !done && (
          <>
        {/* METODO */}
        <div className="bg-[#0f151c] border border-emerald-500/20 rounded-2xl p-5 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              {getIcon()}
            </div>

            <div>

              <p className="text-xs text-zinc-400 uppercase tracking-wider">
                Método de pago seleccionado
              </p>

              <h2 className="text-xl font-bold text-emerald-400">
                {metodo}
              </h2>

            </div>

          </div>

        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={enviarFormulario}
          className="bg-[#0f151c] border border-emerald-500/10 rounded-2xl p-6 md:p-8"
        >

          <h2 className="text-2xl font-bold mb-2">
            Información personal
          </h2>

          <p className="text-sm text-zinc-400 mb-7">
            Ingresa la información solicitada para continuar.
          </p>

          {/* DATOS PERSONALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NOMBRE */}
            <div>

              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nombre completo
              </label>

              <div className="relative">

                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    actualizarCampo("nombre", e.target.value)
                  }
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                />

              </div>

            </div>

            {/* DOCUMENTO */}
            <div>

              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Número de documento
              </label>

              <input
                type="text"
                required
                value={formData.documento}
                onChange={(e) =>
                  actualizarCampo("documento", e.target.value)
                }
                placeholder="Número de documento"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
              />

            </div>

            {/* CORREO */}
            <div>

              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Correo electrónico
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) =>
                    actualizarCampo("correo", e.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                />

              </div>

            </div>

            {/* TELEFONO */}
            <div>

              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Número de celular
              </label>

              <div className="relative">

                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) =>
                    actualizarCampo("telefono", e.target.value)
                  }
                  placeholder="300 000 0000"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                />

              </div>

            </div>

          </div>

          {/* DATOS SEGÚN METODO */}
          <div className="border-t border-white/10 mt-8 pt-8">

            <h2 className="text-2xl font-bold mb-2">
              Datos de {metodo}
            </h2>

            <p className="text-sm text-zinc-400 mb-6">
              Información adicional para el método seleccionado.
            </p>

            {/* PSE */}
            {metodo === "PSE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Banco
                  </label>

                  <select
                    required
                    value={formData.banco}
                    onChange={(e) =>
                      actualizarCampo("banco", e.target.value)
                    }
                    className="w-full bg-[#10171e] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                  >

                    <option value="">
                      Selecciona tu banco
                    </option>

                    <option value="Bancolombia">
                      Bancolombia
                    </option>

                    <option value="Davivienda">
                      Davivienda
                    </option>

                    <option value="Banco de Bogotá">
                      Banco de Bogotá
                    </option>

                    <option value="BBVA">
                      BBVA
                    </option>

                    <option value="Banco de Occidente">
                      Banco de Occidente
                    </option>

                    <option value="Scotiabank Colpatria">
                      Scotiabank Colpatria
                    </option>

                    <option value="Otro">
                      Otro
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Tipo de persona
                  </label>

                  <select
                    value={formData.tipoPersona}
                    onChange={(e) =>
                      actualizarCampo(
                        "tipoPersona",
                        e.target.value
                      )
                    }
                    className="w-full bg-[#10171e] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                  >

                    <option value="Persona natural">
                      Persona natural
                    </option>

                    <option value="Persona jurídica">
                      Persona jurídica
                    </option>

                  </select>

                </div>

              </div>
            )}

            {/* TARJETA */}
            {metodo === "Tarjeta" && (
              <div className="space-y-5">

                <div>

                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre del titular
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.titularTarjeta}
                    onChange={(e) =>
                      actualizarCampo(
                        "titularTarjeta",
                        e.target.value
                      )
                    }
                    placeholder="Nombre como aparece en la tarjeta"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Número de tarjeta
                  </label>

                  <div className="relative">

                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={19}
                      value={formData.numeroTarjeta}
                      onChange={(e) =>
                        actualizarCampo(
                          "numeroTarjeta",
                          e.target.value
                        )
                      }
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Vencimiento
                    </label>

                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={formData.vencimiento}
                      onChange={(e) =>
                        actualizarCampo(
                          "vencimiento",
                          e.target.value
                        )
                      }
                      placeholder="MM/AA"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      CVV
                    </label>

                    <input
                      type="password"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      value={formData.cvv}
                      onChange={(e) =>
                        actualizarCampo(
                          "cvv",
                          e.target.value
                        )
                      }
                      placeholder="•••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />

                  </div>

                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">

                  <Lock className="w-4 h-4" />

                  Estos datos no se almacenarán en esta aplicación.

                </div>

              </div>
            )}

          </div>

          {/* ERRORES */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BOTON */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isProcessing || !!transactionData}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-lg transition transform ${
                isProcessing || !!transactionData
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-emerald-500/20 hover:scale-[1.01]"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando pago simulado...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Confirmar y Simular Pago</span>
                </>
              )}
            </button>
          </div>

          {/* SEGURIDAD */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Simulación segura y protegida en entorno Sandbox</span>
          </div>

        </form>

          </>
        )}

        {/* PROCESANDO */}
        {isProcessing && (
          <div className="bg-[#0f151c] border border-emerald-500/30 rounded-3xl p-8 animate-in fade-in duration-300">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
            <ul className="space-y-3 max-w-sm mx-auto">
              {PROCESSING_STEPS.map((label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 text-sm ${
                    i < processingIdx ? "text-emerald-300" : i === processingIdx ? "text-white" : "text-zinc-600"
                  }`}
                >
                  {i < processingIdx ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : i === processingIdx ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-zinc-700" />
                  )}
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-xs text-zinc-500 mt-6">No cierres esta ventana.</p>
          </div>
        )}

        {/* CONFIRMACIÓN (beats): ultimo paso, aqui se descarga */}
        {transactionData && (
          <div className="p-6 rounded-3xl bg-[#0f151c] border border-emerald-500/40 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-white">¡Pago Simulado Exitoso!</h3>
                  <p className="text-xs text-zinc-400">
                    Transacción: <span className="font-mono text-emerald-400">{transactionData.transactionId}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                LICENCIA GENERADA
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {transactionData.purchases.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-4"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{p.trackTitle}</h4>
                    <p className="text-xs text-zinc-400">Audio Master WAV/MP3 • Licencia Comercial Activa</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(p.trackId, p.trackTitle)}
                    disabled={downloadingId === p.trackId}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {downloadingId === p.trackId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Descargando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Descargar Beat</span>
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-400">
              <Link href="/inicio" className="text-emerald-400 hover:text-emerald-300 hover:underline">
                ← Volver al catálogo de Beats
              </Link>
              <span>Tus beats también quedan guardados en tu perfil.</span>
            </div>
          </div>
        )}

        {/* CONFIRMACIÓN (plan) */}
        {subscriptionData && (
          <div className="p-6 rounded-3xl bg-[#0f151c] border border-emerald-500/40 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">¡Ya tienes el plan {subscriptionData.planName}!</h3>
                <p className="text-xs text-zinc-400">
                  Transacción: <span className="font-mono text-emerald-400">{subscriptionData.transactionId}</span>
                </p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-zinc-400 text-xs">Pagado</dt>
                <dd className="font-bold text-emerald-400">{formatCop(subscriptionData.amount)}</dd>
              </div>
              <div>
                <dt className="text-zinc-400 text-xs">Facturación</dt>
                <dd className="font-bold">{subscriptionData.period === "YEARLY" ? "Anual" : "Mensual"}</dd>
              </div>
              <div>
                <dt className="text-zinc-400 text-xs">Válido hasta</dt>
                <dd className="font-bold">{new Date(subscriptionData.endsAt).toLocaleDateString("es-CO")}</dd>
              </div>
              <div>
                <dt className="text-zinc-400 text-xs">Beats que puedes subir</dt>
                <dd className="font-bold">{subscriptionData.maxBeats === null ? "Ilimitados" : subscriptionData.maxBeats}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/perfil"
                className="flex-1 text-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm"
              >
                Ver mi perfil
              </Link>
              <Link
                href="/inicio"
                className="flex-1 text-center px-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10"
              >
                Ir al catálogo
              </Link>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}

export default function DatosPagoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090d10] text-white flex items-center justify-center">
          <p className="text-zinc-400">Cargando...</p>
        </main>
      }
    >
      <DatosPagoContent />
    </Suspense>
  );
}