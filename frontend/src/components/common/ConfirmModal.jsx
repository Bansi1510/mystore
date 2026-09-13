import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onCancel} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isDanger
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
