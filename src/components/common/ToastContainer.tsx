import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { AlertTriangle, CheckCircle2, Info, Sparkles, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProjects();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        let borderClass = 'border-purple-500/30';
        let bgClass = 'bg-[#181236]/95';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

        if (toast.type === 'cyan') {
          borderClass = 'border-cyan-500/40 shadow-cyan-glow';
          icon = <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-spin-slow" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-purple-400/40';
          icon = <Info className="w-5 h-5 text-purple-300 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/50';
          bgClass = 'bg-[#2a0f1a]/95';
          icon = <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-md shadow-2xl text-slate-100 text-sm animate-slide-up transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="font-medium text-slate-200">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

