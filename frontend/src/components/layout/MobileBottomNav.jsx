import React from 'react';
import { NavLink } from 'react-router-dom';
import { HardDrive, Star, Clock, Database, Settings, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function MobileBottomNav() {
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Drive', icon: HardDrive, path: '/drive' },
    { name: 'Recent', icon: Clock, path: '/recent' },
    { name: 'Starred', icon: Star, path: '/starred' },
    { name: 'Storage', icon: Database, path: '/storage' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user?.role === 'admin') {
    navItems.splice(3, 0, { name: 'Admin', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
