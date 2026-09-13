import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export default function Toast() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                : isError
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
