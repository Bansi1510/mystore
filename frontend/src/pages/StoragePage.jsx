import React, { useEffect, useState } from 'react';
import { Database, Image, Video, Music, FileText, FileArchive, HardDrive, Trash2 } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import api from '../services/api';

export default function StoragePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/storage')
      .then((res) => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading storage dashboard...</div>;
  }

  const { storage, largestFiles, recentUploads } = data;
  const breakdown = storage.categoryBreakdown;

  const categories = [
    { name: 'Images', bytes: breakdown.images, color: 'bg-emerald-500', icon: Image },
    { name: 'Videos', bytes: breakdown.videos, color: 'bg-rose-500', icon: Video },
    { name: 'Documents & PDFs', bytes: breakdown.documents + breakdown.pdf, color: 'bg-blue-500', icon: FileText },
    { name: 'Audio', bytes: breakdown.audio, color: 'bg-amber-500', icon: Music },
    { name: 'Archives', bytes: breakdown.archives, color: 'bg-orange-500', icon: FileArchive },
    { name: 'Trash Size', bytes: storage.trashBytes, color: 'bg-slate-400', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Storage Overview</h2>
              <p className="text-xs text-slate-400">
                {formatBytes(storage.usedBytes)} of {storage.totalLimitGb} GB Used ({storage.usedPercentage}%)
              </p>
            </div>
          </div>
        </div>

        {/* Meter */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
          {categories.map((cat, idx) => {
            const pct = storage.totalLimitBytes > 0 ? (cat.bytes / storage.totalLimitBytes) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={idx}
                className={`${cat.color} h-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${cat.name}: ${formatBytes(cat.bytes)}`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {formatBytes(cat.bytes)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-brand-500" />
          <span>Largest Files</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400">
                <th className="pb-3 px-2">Filename</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2 text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {largestFiles.map((file) => (
                <tr key={file._id} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {file.filename}
                  </td>
                  <td className="py-3 px-2 text-xs text-slate-500 capitalize">{file.category}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-700 dark:text-slate-300">
                    {formatBytes(file.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
