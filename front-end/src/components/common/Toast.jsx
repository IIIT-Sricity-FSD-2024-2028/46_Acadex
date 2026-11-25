import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removed } from '../../store/actions/toastActions';

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toast);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-elevation-3 border text-xs font-semibold backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/20'
              : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-500/40 shadow-rose-950/20'
                : 'bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-primary-fixed flex-shrink-0" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(removed(toast.id))}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
