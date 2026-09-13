import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Files,
  Folder,
  Database,
  UploadCloud,
  Download,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading admin dashboard...</div>;
  }

  const { stats, categoryDistribution, recentActivities, systemHealth } = data;

  const statCards = [
    { title: 'Total Files', value: stats.totalFiles, icon: Files, color: 'text-brand-500 bg-brand-500/10' },
    { title: 'Total Folders', value: stats.totalFolders, icon: Folder, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Storage Used', value: formatBytes(stats.usedStorageBytes), icon: Database, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Total Uploads', value: stats.uploadsCount, icon: UploadCloud, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Total Downloads', value: stats.downloadsCount, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Trash Size', value: formatBytes(stats.trashStorageBytes), icon: Activity, color: 'text-rose-500 bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">System metrics, storage health, and logs overview</p>
          </div>
        </div>

        {/* Health status badges */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              systemHealth.database === 'connected'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}
          >
            {systemHealth.database === 'connected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>DB: {systemHealth.database}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              systemHealth.cloudinary === 'configured'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cloudinary: {systemHealth.cloudinary}</span>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-400 block">{card.title}</span>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          <span>System Activity Logs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400">
                <th className="pb-3 px-2">Action</th>
                <th className="pb-3 px-2">Item Name</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act._id} className="border-b border-slate-100 dark:border-slate-800/60 text-xs">
                  <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">{act.action}</td>
                  <td className="py-3 px-2 text-slate-500 truncate max-w-xs">{act.itemName || '-'}</td>
                  <td className="py-3 px-2 capitalize text-brand-600 dark:text-brand-400 font-medium">{act.role}</td>
                  <td className="py-3 px-2 text-right text-slate-400">{formatDate(act.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
