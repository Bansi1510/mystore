import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/activity?limit=100')
      .then((res) => {
        if (res.data.success) {
          setActivities(res.data.activities);
        }
      })
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Activity className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Audit & Activity Logs</h1>
          <p className="text-xs text-slate-400">Detailed system events log</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading activity logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Item Type</th>
                  <th className="pb-3 px-3">Item Name</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act._id} className="border-b border-slate-100 dark:border-slate-800/60 text-xs">
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">{act.action}</td>
                    <td className="py-3.5 px-3 uppercase text-slate-500 font-mono text-[11px]">{act.itemType}</td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">{act.itemName || '-'}</td>
                    <td className="py-3.5 px-3 capitalize font-semibold text-amber-600 dark:text-amber-400">{act.role}</td>
                    <td className="py-3.5 px-3 text-right text-slate-400">{formatDate(act.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
