import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-800/90 border-slate-700 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-950/90 border-emerald-700/50 text-emerald-100';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-950/90 border-rose-700/50 text-rose-100';
          Icon = XCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-950/90 border-amber-700/50 text-amber-100';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 mr-3 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1">
              {toast.title && <h4 className="font-semibold text-sm mb-0.5">{toast.title}</h4>}
              <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
