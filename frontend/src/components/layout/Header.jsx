import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Bell,
  Menu,
  Grid,
  List,
  HardDrive,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useDriveStore } from '../../store/driveStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function Header({ onToggleMobileSidebar, onOpenNotifications }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { viewMode, setViewMode, searchQuery, setSearchQuery } = useDriveStore();
  const { unreadCount } = useNotificationStore();
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate('/drive')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg leading-none block">
              CloudVault
            </span>
            <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400 uppercase tracking-widest block">
              Personal Drive
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search files, folders, or type:pdf, size:>10MB..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>
      </form>

      {/* Right: Controls & User Info */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Current Theme: ${theme}`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Laptop className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              user?.role === 'admin'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
            }`}
          >
            {user?.role === 'admin' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">{user?.role || 'User'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
