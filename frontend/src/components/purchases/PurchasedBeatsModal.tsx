"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyPurchasesApi, downloadBeatFile } from "@/services/api";
import { Purchase } from "@/types";
import {
  X,
  Download,
  Music2,
  BadgeCheck,
  Calendar,
  ShoppingBag,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  ShieldCheck,
  Disc3,
} from "lucide-react";

interface PurchasedBeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getImageUrl(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
}

export default function PurchasedBeatsModal({
  isOpen,
  onClose,
}: PurchasedBeatsModalProps) {
  const { user, token, isAuthenticated } = useAuth();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      loadPurchases();
    }
  }, [isOpen, token]);

  const loadPurchases = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await fetchMyPurchasesApi(token);
      setPurchases(data);
    } catch (err: any) {
      console.error("Error al cargar beats adquiridos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownload = async (trackId: string, trackTitle?: string) => {
    if (!token) return;
    try {
      setDownloadingId(trackId);
      await downloadBeatFile(token, trackId, trackTitle);
      showNotification("success", `¡Descarga de "${trackTitle || "Beat"}" iniciada!`);
    } catch (err: any) {
      showNotification("error", err.message || "Error al descargar el archivo de audio.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredPurchases = purchases.filter((p) => {
    const title = p.track?.title?.toLowerCase() || "";
    const genre = p.track?.genre?.toLowerCase() || "";
    const ref = p.transactionId?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return title.includes(q) || genre.includes(q) || ref.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-hide text-zinc-100">
        
        {/* TOAST NOTIFICATION */}
        {notification && (
          <div
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-950/70 border-emerald-800/60 text-emerald-200"
                : "bg-red-950/70 border-red-800/60 text-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Disc3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Mis Beats Adquiridos
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {purchases.length} {purchases.length === 1 ? "licencia" : "licencias"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Archivos master WAV/MP3 listos para producción comercial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH BAR */}
        {purchases.length > 0 && (
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-zinc-700 transition">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en mis licencias por título, género o ref..."
              className="w-full bg-transparent border-none py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 text-zinc-400 hover:text-white mr-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-xs">Cargando tus licencias registradas...</span>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-100 mb-1">
                Aún no has adquirido beats
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
                Al adquirir licencias en la tienda, tus descargas de audio y contratos aparecerán registrados en esta sección.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-2 rounded-xl transition"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs">
              No se encontraron resultados para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredPurchases.map((p) => {
                const trackData = p.track;
                const trackTitle = trackData?.title || "Beat Adquirido";
                const cover = getImageUrl(trackData?.coverUrl);
                const trackId = p.trackId || p.track?.id || "";

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                        {cover ? (
                          <img
                            src={cover}
                            alt={trackTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <Music2 className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
                            {trackTitle}
                          </h4>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                            <BadgeCheck className="w-3 h-3" />
                            ACTIVA
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {trackData?.genre || "Instrumental"} • {trackData?.producer?.name || "OZIRIS Producer"}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 font-mono">
                          <span>
                            {new Date(p.createdAt).toLocaleDateString("es-CO")}
                          </span>
                          <span>•</span>
                          <span>Ref: {p.transactionId || p.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(trackId, trackTitle)}
                      disabled={downloadingId === trackId}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shrink-0"
                    >
                      {downloadingId === trackId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Descargando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar Audio</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3.5 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Licencia comercial no exclusiva • WAV + MP3 Master</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
