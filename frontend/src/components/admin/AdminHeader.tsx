import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { User } from '@/types';

interface AdminHeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser, onLogout }) => {
  return (
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
            onClick={onLogout}
            className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
