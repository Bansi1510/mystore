import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Clock,
  Star,
  Trash2,
  Database,
  Settings,
  Plus,
  FolderPlus,
  Upload,
  LayoutDashboard,
  Activity,
  Files,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes } from '../../utils/formatters';

export default function Sidebar({ onCloseMobile }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setUploadModalOpen, setCreateFolderOpen, storageInfo } = useDriveStore();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const mainNavItems = [
    { name: 'My Drive', icon: HardDrive, path: '/drive' },
    { name: 'Recent', icon: Clock, path: '/recent' },
    { name: 'Starred', icon: Star, path: '/starred' },
    { name: 'Trash', icon: Trash2, path: '/trash' },
    { name: 'Storage', icon: Database, path: '/storage' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Activity Logs', icon: Activity, path: '/admin/activity' },
    { name: 'System Files', icon: Files, path: '/admin/files' },
    { name: 'System Settings', icon: Sliders, path: '/admin/settings' },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* "+ New" Upload Action Menu */}
        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Upload</span>
          </button>

          {isNewMenuOpen && (
            <>
              <div
                onClick={() => setIsNewMenuOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 space-y-1 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    setCreateFolderOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-brand-500" />
                  <span>New Folder</span>
                </button>

                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    setUploadModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>File Upload</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Navigation Section (Rendered exclusively for admin role) */}
        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div className="px-3 text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Storage Meter Widget */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">Storage Used</span>
          <span>{storageInfo ? `${storageInfo.usedPercentage}%` : '0%'}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${storageInfo?.usedPercentage || 0}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{formatBytes(storageInfo?.usedBytes || 0)} used</span>
          <span>{storageInfo?.totalLimitGb || 100} GB Total</span>
        </div>
      </div>
    </aside>
  );
}
