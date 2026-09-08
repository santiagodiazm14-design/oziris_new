"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  Lock,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export default function DatosPagoPage() {
  const searchParams = useSearchParams();

  const metodo = searchParams.get("metodo") || "PSE";
  const beatId = searchParams.get("beat") || "";

  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    correo: "",
    telefono: "",
    banco: "",
    tipoPersona: "Persona natural",
    celularNequi: "",
    titularTarjeta: "",
    numeroTarjeta: "",
    vencimiento: "",
    cvv: "",
  });

  const [enviado, setEnviado] = useState(false);

  const actualizarCampo = (
    campo: string,
    valor: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const enviarFormulario = (e: React.FormEvent) => {
    e.preventDefault();

    setEnviado(true);
  };

  const getIcon = () => {
    if (metodo === "Tarjeta") {
      return <CreditCard className="w-6 h-6 text-purple-400" />;
    }

    if (metodo === "Nequi") {
      return <Smartphone className="w-6 h-6 text-pink-400" />;
    }

    return <Building2 className="w-6 h-6 text-blue-400" />;
  };

  const getDescription = () => {
    if (metodo === "PSE") {
      return "Completa tus datos para continuar con el pago por PSE.";
    }

    if (metodo === "Tarjeta") {
      return "Completa los datos necesarios para realizar tu pago.";
    }

    if (metodo === "Nequi") {
      return "Ingresa tus datos para continuar con el pago por Nequi.";
    }

    return "Completa tus datos para continuar con el pago por Bancolombia.";
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <Link
            href={`/checkout?beat=${beatId}`}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al pago</span>
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
      <section className="max-w-4xl mx-auto px-4 py-12">

        {/* TITULO */}
        <div className="text-center mb-10">

          <span className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-5">

            <ShieldCheck className="w-4 h-4" />

            Información de compra

          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tus datos
          </h1>

          <p className="text-zinc-400 max-w-xl mx-auto">
            {getDescription()}
          </p>

        </div>

        {/* METODO */}
        <div className="bg-[#121216] border border-purple-500/20 rounded-2xl p-5 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              {getIcon()}
            </div>

            <div>

              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Método de pago seleccionado
              </p>

              <h2 className="text-xl font-bold text-purple-400">
                {metodo}
              </h2>

            </div>

          </div>

        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={enviarFormulario}
          className="bg-[#121216] border border-white/10 rounded-2xl p-6 md:p-8"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                    className="w-full bg-[#18181d] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-purple-500 transition"
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
                    className="w-full bg-[#18181d] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-purple-500 transition"
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

            {/* NEQUI */}
            {metodo === "Nequi" && (
              <div>

                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Número de celular Nequi
                </label>

                <div className="relative">

                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                  <input
                    type="tel"
                    required
                    value={formData.celularNequi}
                    onChange={(e) =>
                      actualizarCampo(
                        "celularNequi",
                        e.target.value
                      )
                    }
                    placeholder="300 000 0000"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
                  />

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
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
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
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 transition"
                    />

                  </div>

                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">

                  <Lock className="w-4 h-4" />

                  Estos datos no se almacenarán en esta aplicación.

                </div>

              </div>
            )}

            {/* BANCOLOMBIA */}
            {metodo === "Bancolombia" && (
              <div>

                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Banco
                </label>

                <input
                  type="text"
                  value="Bancolombia"
                  readOnly
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-zinc-400 outline-none"
                />

                <p className="text-xs text-zinc-500 mt-3">
                  Al continuar se preparará la información necesaria
                  para realizar la transferencia.
                </p>

              </div>
            )}

          </div>

          {/* BOTON */}
          <div className="mt-8">

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition transform hover:scale-[1.01]"
            >

              <Lock className="w-5 h-5" />

              Continuar con el pago

            </button>

          </div>

          {/* SEGURIDAD */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">

            <ShieldCheck className="w-4 h-4 text-emerald-400" />

            Compra segura y protegida

          </div>

        </form>

        {/* MENSAJE DE PRUEBA */}
        {enviado && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">

            <div className="flex items-center gap-3">

              <CheckCircle2 className="w-6 h-6 text-emerald-400" />

              <div>

                <h3 className="font-bold text-emerald-400">
                  Información recibida
                </h3>

                <p className="text-sm text-zinc-400 mt-1">
                  El formulario funciona correctamente.
                  La conexión con el sistema de pagos se realizará
                  posteriormente.

                </p>

              </div>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}