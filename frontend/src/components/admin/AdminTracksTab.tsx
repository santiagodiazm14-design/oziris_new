import React from 'react';
import { Music, Trash2 } from 'lucide-react';
import { Track } from '@/types';

interface AdminTracksTabProps {
  tracks: Track[];
  isLoadingTracks: boolean;
  onSelectTrackToDelete: (track: Track) => void;
}

export const AdminTracksTab: React.FC<AdminTracksTabProps> = ({
  tracks,
  isLoadingTracks,
  onSelectTrackToDelete,
}) => {
  return (
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
                        onClick={() => onSelectTrackToDelete(t)}
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
  );
};
