"use client";

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  fetchTracks,
  deleteTrackApi,
  AdminStats,
  User,
  Track,
} from '@/services/api';
import {
  Users,
  Music,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Shield,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user: currentUser, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content'>('dashboard');

  // Stats State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Tracks State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Modals & Notifications
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Data
  const loadStats = async () => {
    if (!token) return;
    try {
      setIsLoadingStats(true);
      const data = await fetchAdminStats(token);
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    try {
      setIsLoadingUsers(true);
      const data = await fetchAdminUsers(token, userSearch);
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      showNotification('error', err.message || 'Error al obtener lista de usuarios.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTracksData = async () => {
    try {
      setIsLoadingTracks(true);
      const data = await fetchTracks();
      setTracks(data);
    } catch (err: any) {
      console.error('Error fetching tracks:', err);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadTracksData();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') {
        loadUsers();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // User Actions
  const handleToggleUserStatus = async (userToToggle: User) => {
    if (!token) return;
    try {
      const nextStatus = !userToToggle.isActive;
      await updateAdminUser(token, userToToggle.id, { isActive: nextStatus });
      showNotification('success', `Usuario ${userToToggle.name} ${nextStatus ? 'activado' : 'desactivado'}.`);
      loadUsers();
      loadStats();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cambiar estado.');
    }
  };

  const handleToggleUserRole = async (userToToggle: User) => {
    if (!token) return;
    try {
      const nextRole = userToToggle.role === 'ADMIN' ? 'USER' : 'ADMIN';
      await updateAdminUser(token, userToToggle.id, { role: nextRole });
      showNotification('success', `Rol de ${userToToggle.name} cambiado a ${nextRole}.`);
      loadUsers();
      loadStats();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al cambiar rol.');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !token) return;
    try {
      await deleteAdminUser(token, userToDelete.id);
      showNotification('success', `Usuario ${userToDelete.name} eliminado correctamente.`);
      setUserToDelete(null);
      loadUsers();
      loadStats();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar usuario.');
    }
  };

  // Track Actions
  const confirmDeleteTrack = async () => {
    if (!trackToDelete || !token) return;
    try {
      await deleteTrackApi(token, trackToDelete.id);
      showNotification('success', `Beat "${trackToDelete.title}" eliminado correctamente.`);
      setTrackToDelete(null);
      loadTracksData();
      loadStats();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al eliminar Beat.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-sm animate-in slide-in-from-top duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/90 border-red-500/40 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b border-white/10 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/inicio"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a OZIRIS</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded text-xs tracking-wider">
                ADMIN
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">Panel de Administración</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{currentUser?.name}</span>
              <span className="text-[11px] text-purple-400 font-mono">{currentUser?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Usuarios</span>
            <span className="ml-1 bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'content'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Gestión de Beats ({tracks.length})</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Total Usuarios</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">
                    {isLoadingStats ? '...' : stats?.totalUsers || 0}
                  </h3>
                  <span className="text-[11px] text-purple-400 mt-1 inline-block">Registrados en la plataforma</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Usuarios Activos</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {isLoadingStats ? '...' : stats?.activeUsers || 0}
                  </h3>
                  <span className="text-[11px] text-emerald-400/80 mt-1 inline-block">Con acceso habilitado</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Beats Publicados</p>
                  <h3 className="text-3xl font-extrabold text-blue-400 mt-1">
                    {isLoadingStats ? '...' : stats?.totalTracks || tracks.length}
                  </h3>
                  <span className="text-[11px] text-blue-400/80 mt-1 inline-block">Catálogo disponible</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Music className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Ventas Totales</p>
                  <h3 className="text-3xl font-extrabold text-amber-400 mt-1">
                    ${isLoadingStats ? '...' : (stats?.totalRevenue || 359.88).toFixed(2)}
                  </h3>
                  <span className="text-[11px] text-amber-400/80 mt-1 inline-block">Ingresos generados</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#121216] border border-white/10 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas de Administrador</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-purple-500/20"
                >
                  <Users className="w-4 h-4" />
                  <span>Gestionar Usuarios</span>
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-medium text-sm transition"
                >
                  <Music className="w-4 h-4" />
                  <span>Moderar Catálogo de Beats</span>
                </button>
                <button
                  onClick={() => {
                    loadStats();
                    loadUsers();
                    loadTracksData();
                    showNotification('success', 'Datos del sistema actualizados.');
                  }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-5 py-2.5 rounded-xl font-medium text-sm transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar Métricas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="text-xs text-zinc-400 font-mono">
                Mostrando {users.length} usuarios
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Usuario</th>
                      <th className="py-3.5 px-4 font-semibold">Correo</th>
                      <th className="py-3.5 px-4 font-semibold">Rol</th>
                      <th className="py-3.5 px-4 font-semibold">Estado</th>
                      <th className="py-3.5 px-4 font-semibold">Fecha Registro</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-200">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
                          Cargando lista de usuarios...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
                          No se encontraron usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{u.name}</p>
                                {u.bio && <p className="text-[11px] text-zinc-500 truncate max-w-[150px]">{u.bio}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              title="Hacer clic para cambiar rol"
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                              }`}
                            >
                              <Shield className="w-3 h-3" />
                              <span>{u.role}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              title="Hacer clic para cambiar estado"
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition inline-flex items-center gap-1 ${
                                u.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className="p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition"
                                title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTENT / BEATS MANAGEMENT */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Catálogo de Beats Publicados</h3>
              <span className="text-xs text-zinc-400 font-mono">{tracks.length} Beats activos</span>
            </div>

            <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Beat</th>
                      <th className="py-3.5 px-4 font-semibold">Género</th>
                      <th className="py-3.5 px-4 font-semibold">Precio</th>
                      <th className="py-3.5 px-4 font-semibold">Productor</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-200">
                    {isLoadingTracks ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                          Cargando Beats...
                        </td>
                      </tr>
                    ) : tracks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                          No hay Beats publicados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      tracks.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                                {t.coverUrl ? (
                                  <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Music className="w-5 h-5 text-purple-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{t.title}</p>
                                <p className="text-[11px] text-zinc-400">
                                  {t.bpm ? `${t.bpm} BPM` : ''} {t.key ? `• ${t.key}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                              {t.genre || 'Beat'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">
                            ${Number(t.price).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300 text-xs">
                            {t.producer?.name || 'Productor OZIRIS'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setTrackToDelete(t)}
                              className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition"
                              title="Eliminar Beat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL USER DELETE */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirmar Eliminación</h3>
            </div>
            <p className="text-sm text-zinc-300">
              ¿Estás seguro de que deseas eliminar permanentemente al usuario{' '}
              <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition"
              >
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL TRACK DELETE */}
      {trackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Eliminar Beat del Catálogo</h3>
            </div>
            <p className="text-sm text-zinc-300">
              ¿Estás seguro de que deseas eliminar el Beat <strong className="text-white">"{trackToDelete.title}"</strong> del catálogo de OZIRIS?
            </p>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setTrackToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTrack}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition"
              >
                Sí, Eliminar Beat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
