import React, { useState } from 'react';
import { X, Share2, Copy, Check, Lock, Calendar, Eye, Download } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';

export default function ShareModal() {
  const { isShareModalOpen, shareTarget, setShareModalOpen } = useDriveStore();
  const { addToast } = useNotificationStore();

  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowPreview, setAllowPreview] = useState(true);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isShareModalOpen || !shareTarget) return null;

  const isFolder = !shareTarget.cloudinaryPublicId;

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const payload = {
        targetType: isFolder ? 'folder' : 'file',
        targetId: shareTarget._id,
        password: password.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        allowDownload,
        allowPreview,
      };

      const res = await api.post('/share', payload);
      if (res.data.success) {
        const fullUrl = `${window.location.origin}/share/${res.data.shareToken}`;
        setGeneratedUrl(fullUrl);
        addToast({ type: 'success', message: 'Share link generated!' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to create share link.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={() => setShareModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-50 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share "{isFolder ? shareTarget.name : shareTarget.filename}"</h3>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedUrl ? (
          <div className="space-y-4">
            {/* Optional Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Optional Password Protection
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for public access"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Optional Expiration Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Link Expiration Date
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Permission Flags */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Allow Download</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowPreview}
                  onChange={(e) => setAllowPreview(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Allow Preview</span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleCreateShare}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all"
              >
                {loading ? 'Creating...' : 'Generate Share Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Share Link Ready</span>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
