import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, X, Activity } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function NotificationCenter({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const { notifications, unreadCount, setNotifications } = useNotificationStore();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications, res.data.unreadCount);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (e) {
      console.warn(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />

      <div className="relative z-50 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-brand-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Activity className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No recent notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-brand-500/30 text-slate-900 dark:text-white shadow-sm'
                }`}
              >
                <h4 className="font-semibold text-sm">{n.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{formatDate(n.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
