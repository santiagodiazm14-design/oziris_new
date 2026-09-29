import React from 'react';
import { Users, UserCheck, Music, DollarSign, RefreshCw } from 'lucide-react';
import { AdminStats, Track } from '@/types';

interface AdminStatsTabProps {
  stats: AdminStats | null;
  isLoadingStats: boolean;
  tracks: Track[];
  onNavigateTab: (tab: 'dashboard' | 'users' | 'content') => void;
  onRefresh: () => void;
}

export const AdminStatsTab: React.FC<AdminStatsTabProps> = ({
  stats,
  isLoadingStats,
  tracks,
  onNavigateTab,
  onRefresh,
}) => {
  return (
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
            onClick={() => onNavigateTab('users')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-purple-500/20"
          >
            <Users className="w-4 h-4" />
            <span>Gestionar Usuarios</span>
          </button>
          <button
            onClick={() => onNavigateTab('content')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            <Music className="w-4 h-4" />
            <span>Moderar Catálogo de Beats</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar Métricas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
