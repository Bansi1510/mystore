import React from 'react';
import { Settings, Sun, Moon, Laptop, Grid, List, ShieldAlert } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useDriveStore } from '../store/driveStore';

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { viewMode, setViewMode } = useDriveStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Settings className="w-6 h-6 text-brand-500" />
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Preferences & Settings</h1>
          <p className="text-xs text-slate-400">Customize your drive appearance and default layouts</p>
        </div>
      </div>

      {/* Theme Setting */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Theme Selection</h3>
        <p className="text-xs text-slate-400">Choose how CloudVault looks to you</p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Mode Setting */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Default Layout View</h3>
        <p className="text-xs text-slate-400">Select default view for file browsing</p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2.5 ${
              viewMode === 'grid'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-xs">Grid View</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`p-4 rounded-2xl border text-center transition-all flex items-center justify-center gap-2.5 ${
              viewMode === 'list'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="text-xs">List View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
