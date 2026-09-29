import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastNotificationProps {
  notification: { type: 'success' | 'error'; message: string } | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ notification }) => {
  if (!notification) return null;

  return (
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
  );
};
