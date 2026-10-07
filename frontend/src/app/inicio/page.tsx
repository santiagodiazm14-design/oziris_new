"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Menu,
  Headphones,
  Grid,
  Activity,
  Play,
  Pause,
  Star,
  Tag,
  Zap,
  Mic,
  ShoppingBag,
  X,
  LogOut,
  UploadCloud,
  Music,
  Shield,
  User as UserIcon,
  Heart,
  Sparkles,
  Download,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import {
  fetchTracks,
  Track,
  fetchFavoritesApi,
  toggleFavoriteApi,
  fetchMyPurchasesApi,
  downloadBeatFile,
} from "@/services/api";
import UploadBeatModal from "@/components/tracks/UploadBeatModal";
import ProfileModal from "@/components/profile/ProfileModal";
import PurchasedBeatsModal from "@/components/purchases/PurchasedBeatsModal";
import FavoritesDrawer from "@/components/favorites/FavoritesDrawer";
import PaymentSimulationModal from "@/components/checkout/PaymentSimulationModal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function InicioPage() {
  const { cartCount, toggleCart, addToCart, isInCart } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currentTrack, isPlaying: isPlayerPlaying, playTrack } = usePlayer();
  const {
    favorites,
    isFavorite,
    toggleFavorite: handleToggleFavorite,
    isFavoritesOpen,
    openFavorites,
    closeFavorites,
  } = useFavorites();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPurchasedBeatsModalOpen, setIsPurchasedBeatsModalOpen] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  
  // FILTERS & SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("rankings");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [searchFilterType, setSearchFilterType] = useState<string>("Beats");
  const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false);

  const [audioError, setAudioError] = useState<string | null>(null);

  // Estados de compras y simulación de pago
  const [purchasedTrackIds, setPurchasedTrackIds] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTrackForPayment, setSelectedTrackForPayment] = useState<Track | null>(null);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("oziris_auth_token") : null;

  const loadUserPurchases = async () => {
    if (!token || !isAuthenticated || isAdmin) {
      setPurchasedTrackIds([]);
      return;
    }
    try {
      const data = await fetchMyPurchasesApi(token);
      if (Array.isArray(data)) {
        const ids = data.map((p) => p.trackId || p.track?.id || "").filter(Boolean);
        setPurchasedTrackIds(ids);
      }
    } catch (err) {
      console.warn("Error al cargar compras del usuario:", err);
    }
  };

  const loadCatalog = async () => {
    try {
      setIsLoadingTracks(true);
      const data = await fetchTracks({
        genre: selectedGenre,
        search: searchQuery,
        tag: selectedTag || undefined,
        category: selectedCategory !== "all" && selectedCategory !== "rankings" ? selectedCategory : undefined,
        sort: selectedSort,
      });

      setTracks(data);
    } catch (err) {
      console.error("Error al cargar catálogo de Beats:", err);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, selectedCategory, selectedTag, selectedSort]);

  useEffect(() => {
    loadUserPurchases();
  }, [token, isAuthenticated, isAdmin]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track, tracks);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedGenre(undefined);
    setSelectedCategory("rankings");
    setSelectedTag(null);
    setSelectedSort("newest");
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedGenre || (selectedCategory && selectedCategory !== "rankings") || selectedTag
  );

  const topCharts = [
    {
      id: "newest",
      title: "Nuevos y Destacados",
      icon: <Activity className="w-6 h-6 text-white" />,
    },
    {
      id: "rankings",
      title: "Mejores Rankings",
      icon: <Grid className="w-6 h-6 text-blue-400" />,
    },
    {
      id: "exclusive",
      title: "Solo Exclusivos",
      icon: <Star className="w-6 h-6 text-amber-400" />,
    },
    {
      id: "under20",
      title: "Menos de $20",
      icon: <Tag className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: "free",
      title: "Beats Promo",
      icon: <Zap className="w-6 h-6 text-purple-400" />,
    },
    {
      id: "all",
      title: "Todos los Beats",
      icon: <Play className="w-6 h-6 text-cyan-400" />,
    },
    {
      id: "coro",
      title: "Beats con Coro",
      icon: <Mic className="w-6 h-6 text-pink-400" />,
    },
  ];

  const trendingTags = [
    "Drake Type Beat",
    "Travis Scott",
    "Bad Bunny",
    "Feid",
    "Drill 140 BPM",
    "Guitar R&B",
    "Gunna",
    "Trap Dark",
  ];

  const genreFilters = [
    "Todo el tiempo",
    "Trap",
    "Drill",
    "Reggaeton",
    "R&B",
    "Hip Hop",
    "Boom Bap",
    "Pop",
    "Dancehall",
  ];

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex flex-col font-sans">
      
      {/* Toast de error de audio */}
      {audioError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 bg-red-900/90 border border-red-500/40 rounded-2xl shadow-2xl backdrop-blur-sm text-sm text-red-200 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-red-400 shrink-0">⚠️</span>
          <span>{audioError}</span>
          <button
            onClick={() => setAudioError(null)}
            className="ml-auto text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =====================================================
          BANNER ANNOUNCEMENT
      ====================================================== */}
      <div className="bg-gradient-to-r from-purple-950/90 via-[#0d0d1a] to-blue-950/90 border-b border-purple-500/20 px-4 py-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between mx-auto max-w-7xl w-full">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[10px] tracking-wider shadow-[0_0_12px_rgba(147,51,234,0.5)]">
              OZIRIS PRO
            </span>
            <span className="font-semibold text-zinc-200">
              Catálogo Oficial de Beats & Instrumentales
            </span>
            <span className="text-zinc-400 hidden md:inline">
              • Licencias 100% libres de regalías con entrega inmediata
            </span>
          </div>

          <Link
            href="/planes"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-full transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Planes</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          HEADER NAVBAR
      ====================================================== */}
      <header className="border-b border-purple-500/20 sticky top-0 bg-[#08080e]/95 backdrop-blur-2xl z-30 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* LEFT: LOGO & NAV */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-purple-300 transition"
              type="button"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/inicio" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-white via-purple-200 to-cyan-400 bg-clip-text text-transparent">
                OZIRIS
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <button
                onClick={() => {
                  setSelectedCategory("newest");
                  setSelectedSort("newest");
                }}
                className={`transition ${selectedCategory === "newest" ? "text-purple-300 font-bold" : "hover:text-purple-300"}`}
              >
                Novedades
              </button>
              <Link href="/planes" className="hover:text-purple-300 transition">
                Precios
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById("genres-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1 hover:text-purple-300 transition"
              >
                Géneros
                <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>

          {/* CENTER: SEARCH BAR */}
          <div className="flex-1 max-w-xl hidden md:flex">
            <div className="w-full relative flex items-center bg-[#12121e] border border-purple-500/25 rounded-full focus-within:border-purple-400 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
              <Search className="w-4 h-4 text-purple-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por género, BPM, artista o tag (Drake, Trap, Drill)..."
                className="w-full bg-transparent border-none py-2 pl-10 pr-28 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  type="button"
                  className="p-1 text-zinc-400 hover:text-white mr-1"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* SEARCH FILTER DROPDOWN */}
              <div className="relative border-l border-purple-500/20 pr-2 pl-2">
                <button
                  type="button"
                  onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-white py-1 px-1.5 rounded-md"
                >
                  <span>{searchFilterType}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showSearchTypeDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-[#161622] border border-purple-500/30 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    {["Beats", "Trap", "Drill", "Reggaeton", "R&B", "Hip Hop"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setSearchFilterType(t);
                          setShowSearchTypeDropdown(false);
                          if (t !== "Beats") setSelectedGenre(t);
                          else setSelectedGenre(undefined);
                        }}
                        className={`w-full text-left px-3 py-1.5 transition ${
                          searchFilterType === t ? "text-purple-300 font-bold bg-purple-500/20" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: BUTTONS & AUTH */}
          <div className="flex items-center gap-3 text-sm font-medium">
            {/* SUBIR BEAT */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 border border-purple-400/20 transition transform hover:scale-105 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Subir Beat</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 text-zinc-300">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                {/* MIS BEATS ADQUIRIDOS (DESCARGAS) */}
                {!isAdmin && (
                  <button
                    onClick={() => setIsPurchasedBeatsModalOpen(true)}
                    type="button"
                    className="relative flex items-center justify-center p-2.5 bg-[#12121e] hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-purple-500/20 hover:border-emerald-500/40 rounded-full transition cursor-pointer group"
                    title="Mis Beats Adquiridos y Descargas"
                  >
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {purchasedTrackIds.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-in zoom-in duration-200">
                        {purchasedTrackIds.length}
                      </span>
                    )}
                  </button>
                )}

                {/* FAVORITOS */}
                <button
                  onClick={openFavorites}
                  type="button"
                  className="relative flex items-center justify-center p-2.5 bg-[#12121e] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-purple-500/20 hover:border-rose-500/40 rounded-full transition cursor-pointer group"
                  title="Mis Beats Favoritos"
                >
                  <Heart className="w-4 h-4 fill-rose-500 group-hover:scale-110 transition-transform" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50 animate-in zoom-in duration-200">
                      {favorites.length}
                    </span>
                  )}
                </button>

                {/* PERFIL */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  type="button"
                  className="flex items-center gap-2 bg-[#12121e] hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-full transition cursor-pointer group"
                  title="Editar mi perfil"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center overflow-hidden border border-purple-500/40">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl.startsWith("http") ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-zinc-200 group-hover:text-purple-300">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="text-xs font-semibold text-zinc-300 hover:text-white transition"
                >
                  Registro
                </Link>
                <Link
                  href="/login"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}

            {/* CARRITO */}
            <button
              onClick={toggleCart}
              type="button"
              className="relative flex items-center justify-center p-2.5 bg-[#12121e] hover:bg-purple-500/20 text-zinc-300 hover:text-white border border-purple-500/20 rounded-full transition cursor-pointer group"
              title="Carrito de compras"
            >
              <ShoppingBag className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        <div className="md:hidden px-4 pb-3 pt-1">
          <div className="relative flex items-center bg-[#12121e] border border-purple-500/25 rounded-full">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar beats, género, productor..."
              className="w-full bg-transparent border-none py-2 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                type="button"
                className="p-1 text-zinc-400 hover:text-white absolute right-2.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SECONDARY NAVIGATION BAR (GÉNEROS) */}
        <div id="genres-section" className="border-t border-purple-500/10 bg-[#0c0c16]/95 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-center gap-8 text-xs font-semibold text-zinc-400">
            <button
              onClick={() => {
                setSelectedGenre(undefined);
                setSelectedTag(null);
              }}
              className={`flex items-center gap-1.5 transition ${
                !selectedGenre ? "text-purple-400 font-bold border-b-2 border-purple-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Todos los Beats
            </button>
            <button
              onClick={() => setSelectedGenre("Trap")}
              className={`flex items-center gap-1.5 transition ${
                selectedGenre === "Trap" ? "text-purple-400 font-bold border-b-2 border-purple-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Trap
            </button>
            <button
              onClick={() => setSelectedGenre("Drill")}
              className={`flex items-center gap-1.5 transition ${
                selectedGenre === "Drill" ? "text-cyan-400 font-bold border-b-2 border-cyan-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              Drill
            </button>
            <button
              onClick={() => setSelectedGenre("Reggaeton")}
              className={`flex items-center gap-1.5 transition ${
                selectedGenre === "Reggaeton" ? "text-pink-400 font-bold border-b-2 border-pink-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-pink-400" />
              Reggaeton & Urbano
            </button>
            <button
              onClick={() => setSelectedGenre("R&B")}
              className={`flex items-center gap-1.5 transition ${
                selectedGenre === "R&B" ? "text-blue-400 font-bold border-b-2 border-blue-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              R&B Soul
            </button>
            <button
              onClick={() => setSelectedGenre("Hip Hop")}
              className={`flex items-center gap-1.5 transition ${
                selectedGenre === "Hip Hop" ? "text-emerald-400 font-bold border-b-2 border-emerald-500 pb-0.5" : "hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              Hip Hop Clásico
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SHOWCASE SECTION (NEON GLOW)
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-purple-500/15 py-12 md:py-16 bg-gradient-to-b from-[#0e0e1a]/80 via-[#08080c] to-[#08080c]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.25)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tu mercado de beats</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
            Descubre y Adquiere los{" "}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Mejores Beats Urbanos
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl">
            Producciones exclusivas y de alta calidad para artistas de Trap, Drill, Reggaeton y R&B. Escucha, compra y descarga tus pistas al instante.
          </p>

          {/* Quick Search Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-zinc-400 font-mono">Tendencias:</span>
            {trendingTags.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(item);
                  setSelectedTag(null);
                }}
                className={`text-xs px-3 py-1 rounded-full transition cursor-pointer ${
                  searchQuery === item
                    ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/40 border border-purple-400"
                    : "text-purple-200 bg-[#12121f] hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                #{item}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-4 border-t border-purple-500/15 w-full max-w-xl">
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white">100%</p>
              <p className="text-[11px] text-purple-300 font-medium">Exclusivos</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-cyan-400">Audio</p>
              <p className="text-[11px] text-zinc-400 font-medium">WAV + MP3</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">Instant</p>
              <p className="text-[11px] text-zinc-400 font-medium">Descarga Inmediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CATALOG CONTAINER
      ====================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 pb-32 flex flex-col gap-8">
        
        {/* SECTION HEADER & CONTROLS */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-purple-500/15 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Catálogo de Beats</span>
              <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.4)]">
                {tracks.length} {tracks.length === 1 ? "Beat disponible" : "Beats disponibles"}
              </span>
            </h2>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                type="button"
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar Filtros</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* ORDENAMIENTO */}
            <div className="flex items-center gap-2 bg-[#12121e] border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Ordenar:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[#12121e]">Más recientes</option>
                <option value="price_asc" className="bg-[#12121e]">Menor precio</option>
                <option value="price_desc" className="bg-[#12121e]">Mayor precio</option>
                <option value="bpm_asc" className="bg-[#12121e]">BPM (Tempo)</option>
              </select>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              type="button"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 border border-purple-400/20 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              <span>+ Subir Nuevo Beat</span>
            </button>
          </div>
        </div>

        {/* =====================================================
            CATEGORIES (CYBERPUNK CAROUSEL)
        ====================================================== */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {topCharts.map((item) => {
            const isCategoryActive = selectedCategory === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.id);
                  if (item.id === "all" || item.id === "rankings") {
                    setSelectedGenre(undefined);
                    setSelectedTag(null);
                  }
                }}
                className="flex flex-col items-center gap-3 snap-start min-w-[105px] group cursor-pointer"
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCategoryActive
                      ? "border-2 border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-105 text-purple-300"
                      : "bg-[#11111d] border border-purple-500/15 text-zinc-400 group-hover:bg-[#161626] group-hover:border-purple-500/40 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                  }`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-xs font-semibold ${
                    isCategoryActive ? "text-purple-300 font-bold" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* =====================================================
            GENRE FILTER PILLS
        ====================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genreFilters.map((filter, i) => {
            const isSelected = (i === 0 && !selectedGenre) || selectedGenre === filter;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedGenre(i === 0 ? undefined : filter)}
                className={`flex items-center gap-2 transition rounded-full px-4 py-1.5 text-xs font-bold shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30"
                    : "bg-[#11111d] text-zinc-400 hover:text-white hover:bg-[#161626] border border-purple-500/15 hover:border-purple-500/30"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            BEATS LISTING
        ====================================================== */}
        {isLoadingTracks ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
            <div className="w-9 h-9 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Cargando catálogo de Beats...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl py-20 bg-white/[0.01] gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Music className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white">
              No se encontraron Beats con los filtros seleccionados
            </h3>

            <p className="text-sm text-zinc-400 max-w-md">
              {searchQuery
                ? `No hay resultados para "${searchQuery}". Intenta con otros términos o géneros.`
                : "No hay beats que coincidan con la categoría seleccionada."}
            </p>

            <button
              onClick={clearAllFilters}
              type="button"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition"
            >
              Ver todos los Beats
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracks.map((track) => {
              const coverPath = track.coverUrl
                ? track.coverUrl.startsWith("http")
                  ? track.coverUrl
                  : `${API_BASE_URL}${track.coverUrl}`
                : null;

              const isPlayingThis = currentTrack?.id === track.id && isPlayerPlaying;

              return (
                <div
                  key={track.id}
                  className="group relative bg-[#0d0d14]/90 border border-purple-500/15 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(147,51,234,0.18)] hover:-translate-y-1 flex flex-col justify-between backdrop-blur-sm"
                >
                  {/* INFORMACIÓN PRINCIPAL */}
                  <div className="flex gap-4 items-start">
                    {/* COVER */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-purple-500/20 group-hover:border-purple-500/50 transition duration-300 shadow-md">
                      {coverPath ? (
                        <img
                          src={coverPath}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/60 to-blue-900/60 text-purple-300">
                          <Music className="w-8 h-8 text-purple-400" />
                        </div>
                      )}

                      {/* PLAY BUTTON */}
                      <button
                        onClick={() => handlePlayTrack(track)}
                        type="button"
                        className={`absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
                          isPlayingThis
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white scale-100 shadow-[0_0_20px_rgba(147,51,234,0.6)]"
                            : "bg-black/70 text-white opacity-90 group-hover:opacity-100 hover:scale-110 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-5 h-5 fill-white text-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* METADATA */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedGenre(track.genre)}
                          className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider bg-purple-500/15 hover:bg-purple-500/30 px-2.5 py-0.5 rounded-full border border-purple-500/30 transition"
                        >
                          {track.genre || "Beat"}
                        </button>

                        <span className="text-sm font-extrabold text-emerald-400">
                          ${Number(track.price).toFixed(2)}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base truncate mt-1.5 group-hover:text-purple-300 transition">
                        {track.title}
                      </h4>

                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        Por{" "}
                        <span className="text-zinc-200 font-medium">
                          {track.producer?.name || "Productor OZIRIS"}
                        </span>
                      </p>

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                        {track.bpm && (
                          <span className="font-mono text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                            {track.bpm} BPM
                          </span>
                        )}

                        {track.key && (
                          <span className="font-mono text-[11px] text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            {track.key}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      TAGS + BOTONES
                  ================================================== */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    {/* TAGS */}
                    <div className="flex gap-1.5 overflow-hidden max-w-[55%]">
                      {track.tags && track.tags.length > 0 ? (
                        track.tags.slice(0, 2).map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedTag(t);
                              setSearchQuery("");
                            }}
                            className="text-[11px] text-purple-300/70 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-2 py-0.5 rounded-full truncate transition"
                          >
                            #{t}
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          OZIRIS Exclusive
                        </span>
                      )}
                    </div>

                    {/* BOTONES */}
                    <div className="flex items-center gap-2">
                      {/* CORAZÓN FAVORITO */}
                      <button
                        onClick={() => handleToggleFavorite(track)}
                        type="button"
                        className={`p-2 rounded-xl transition transform active:scale-90 ${
                          isFavorite(track.id)
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                            : "bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/10"
                        }`}
                        title={isFavorite(track.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(track.id) ? "fill-rose-500" : ""}`} />
                      </button>

                      {/* SI YA FUE COMPRADO: BOTÓN DE DESCARGA DIRECTA */}
                      {purchasedTrackIds.includes(track.id) ? (
                        <button
                          onClick={async () => {
                            if (!token) return;
                            try {
                              setDownloadingTrackId(track.id);
                              await downloadBeatFile(token, track.id, track.title);
                            } catch (err: any) {
                              setAudioError(err.message || "Error al descargar el Beat.");
                            } finally {
                              setDownloadingTrackId(null);
                            }
                          }}
                          type="button"
                          disabled={downloadingTrackId === track.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                          title="Descargar archivo de audio HQ"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingTrackId === track.id ? "Descargando..." : "Descargar"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (isAdmin) {
                              setAudioError("El rol Administrador no puede simular pagos ni comprar beats. Utiliza una cuenta de usuario normal.");
                              return;
                            }
                            if (!isAuthenticated) {
                              setAudioError("Debes iniciar sesión para comprar y descargar beats.");
                              return;
                            }
                            setSelectedTrackForPayment(track);
                            setIsPaymentModalOpen(true);
                          }}
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer ${
                            isInCart(track.id)
                              ? "bg-purple-600 text-white border border-purple-400/40"
                              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-600/30 border border-purple-400/20"
                          }`}
                          title="Simular pago y adquirir beat"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>${Number(track.price).toFixed(2)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =====================================================
          SIDEBAR MENÚ
      ====================================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className="relative w-80 bg-[#101017] border-r border-purple-500/25 h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-left duration-300 z-10">
            
            {/* DRAWER HEADER / USER SUMMARY */}
            <div className="p-6 border-b border-purple-500/20 bg-gradient-to-b from-[#181826] to-[#101017]">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-white via-purple-200 to-cyan-400 bg-clip-text text-transparent">
                  OZIRIS
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-full transition text-zinc-400 hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TARJETA DE USUARIO */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-purple-500/20 shadow-inner">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 bg-purple-950 shrink-0 shadow-md">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl.startsWith("http") ? user.avatarUrl : `${API_BASE_URL}${user.avatarUrl}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg text-purple-200">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">
                      {user?.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {user?.role || "USER"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <p className="text-xs text-zinc-300 font-medium mb-3">
                    Inicia sesión para descargar y guardar tus Beats
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>

            {/* DRAWER MENU ITEMS SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide text-sm">
              
              {/* SECCIÓN: MI BIBLIOTECA */}
              {isAuthenticated && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3">
                    Mi Biblioteca
                  </span>

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsPurchasedBeatsModalOpen(true);
                      }}
                      type="button"
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 text-emerald-300 transition group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                          <Download className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white group-hover:text-emerald-300">
                          Mis Beats Adquiridos
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {purchasedTrackIds.length}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openFavorites();
                    }}
                    type="button"
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-rose-300 transition group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
                        <Heart className="w-4 h-4 fill-rose-500/30" />
                      </div>
                      <span className="font-semibold text-sm text-white group-hover:text-rose-300">
                        Mis Beats Favoritos
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      {favorites.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUploadModalOpen(true);
                    }}
                    type="button"
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 hover:bg-purple-600/25 transition text-purple-200 group text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-105 transition">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-white group-hover:text-purple-300">
                      Subir Nuevo Beat
                    </span>
                  </button>
                </div>
              )}

              {/* SECCIÓN: EXPLORAR CATÁLOGO */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3">
                  Explorar Catálogo
                </span>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    clearAllFilters();
                  }}
                  type="button"
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition text-zinc-300 hover:text-white text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                    <Grid className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Todos los Beats</span>
                </button>

                <Link
                  href="/planes"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition text-zinc-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Planes y Precios</span>
                </Link>

                <Link
                  href="/formas-pago"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition text-zinc-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Formas de Pago</span>
                </Link>
              </div>

              {/* SECCIÓN: CUENTA Y AJUSTES */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3">
                  Cuenta y Ajustes
                </span>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    type="button"
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition text-zinc-300 hover:text-white text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Editar Mi Perfil</span>
                  </button>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 transition text-purple-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Panel Administrador</span>
                  </Link>
                )}
              </div>

            </div>

            {/* DRAWER FOOTER */}
            {isAuthenticated && (
              <div className="p-5 border-t border-white/10 bg-[#0d0d14]">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 1: SUBIR BEAT */}
      <UploadBeatModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          loadCatalog();
        }}
      />

      {/* MODAL 2: EDITAR PERFIL DE USUARIO */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* MODAL 3: MIS BEATS ADQUIRIDOS */}
      <PurchasedBeatsModal
        isOpen={isPurchasedBeatsModalOpen}
        onClose={() => setIsPurchasedBeatsModalOpen(false)}
      />

      {/* DRAWER: MIS BEATS FAVORITOS */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={closeFavorites}
        favorites={favorites}
        onRemoveFavorite={(trackId) => {
          const targetTrack = tracks.find((t) => t.id === trackId) || favorites.find((f) => f.id === trackId);
          if (targetTrack) handleToggleFavorite(targetTrack);
        }}
        onPlayTrack={handlePlayTrack}
        currentlyPlayingId={currentTrack?.id || null}
        isPlaying={isPlayerPlaying}
      />

      {/* MODAL: SIMULACIÓN DE PAGO */}
      <PaymentSimulationModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedTrackForPayment(null);
        }}
        track={selectedTrackForPayment}
        onSuccess={() => {
          loadUserPurchases();
        }}
      />

    </div>
  );
}