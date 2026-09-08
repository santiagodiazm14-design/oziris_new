"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ShoppingBag, ArrowRight, Music2, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, removeFromCart, totalPrice, cartCount } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const checkoutUrl = cartItems.length > 0 ? `/checkout?beat=${cartItems[0].id}` : "/inicio";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop de fondo */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md bg-[#121216] border-l border-white/10 text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* HEADER DEL CARRITO */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tu Carrito</h2>
                <p className="text-xs text-zinc-400">
                  {cartCount} {cartCount === 1 ? "Beat seleccionado" : "Beats seleccionados"}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* LISTA DE BEATS EN EL CARRITO */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Music2 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Tu carrito está vacío</h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-6">
                  Explora nuestro catálogo y agrega tus Beats favoritos para continuar.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  Explorar Beats
                </button>
              </div>
            ) : (
              cartItems.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition group"
                >
                  {/* Portada */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-purple-900/30 border border-purple-500/20">
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
                        <Music2 className="w-6 h-6 text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-white group-hover:text-purple-300 transition">
                      {track.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.genre || "Beat"} • {track.producer?.name || "Oziris Producer"}
                    </p>
                    <p className="text-sm font-bold text-purple-400 mt-1">
                      {formatPrice(track.price)}
                    </p>
                  </div>

                  {/* Botón Eliminar */}
                  <button
                    onClick={() => removeFromCart(track.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                    title="Eliminar del carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* PIE DE PÁGINA Y PAGO */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0d0d10] space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal ({cartCount} beats)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Licencia Comercial</span>
                  <span className="text-emerald-400 font-medium">Incluida</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Link
                href={checkoutUrl}
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/25 transition transform hover:scale-[1.01]"
              >
                <span>Proceder al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pago 100% Seguro y Descarga Inmediata</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
