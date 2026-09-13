import React, { useEffect, useState } from 'react';
import { Sliders, Save, Check } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';

export default function AdminSettingsPage() {
  const { addToast } = useNotificationStore();
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(100);
  const [totalStorageLimitGb, setTotalStorageLimitGb] = useState(100);
  const [defaultShareExpirationDays, setDefaultShareExpirationDays] = useState(7);
  const [trashRetentionDays, setTrashRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/settings')
      .then((res) => {
        if (res.data.success) {
          const s = res.data.settings;
          setMaxFileSizeMb(s.maxFileSizeMb);
          setTotalStorageLimitGb(s.totalStorageLimitGb);
          setDefaultShareExpirationDays(s.defaultShareExpirationDays);
          setTrashRetentionDays(s.trashRetentionDays);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/admin/settings', {
        maxFileSizeMb: Number(maxFileSizeMb),
        totalStorageLimitGb: Number(totalStorageLimitGb),
        defaultShareExpirationDays: Number(defaultShareExpirationDays),
        trashRetentionDays: Number(trashRetentionDays),
      });

      if (res.data.success) {
        addToast({ type: 'success', message: 'System settings updated successfully.' });
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update settings.' });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Sliders className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin System Settings</h1>
          <p className="text-xs text-slate-400">Configure global limits and policies</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Maximum Upload File Size (MB)
          </label>
          <input
            type="number"
            value={maxFileSizeMb}
            onChange={(e) => setMaxFileSizeMb(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Total System Storage Limit (GB)
          </label>
          <input
            type="number"
            value={totalStorageLimitGb}
            onChange={(e) => setTotalStorageLimitGb(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Default Share Link Expiration (Days)
          </label>
          <input
            type="number"
            value={defaultShareExpirationDays}
            onChange={(e) => setDefaultShareExpirationDays(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
}
