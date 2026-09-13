import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('app_theme') || 'system',

  setTheme: (theme) => {
    localStorage.setItem('app_theme', theme);
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    set({ theme });
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('app_theme') || 'system';
    const root = window.document.documentElement;

    if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },
}));
