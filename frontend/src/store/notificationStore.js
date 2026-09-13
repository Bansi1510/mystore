import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,

  addToast: (toast) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, type: 'info', duration: 4000, ...toast };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, newToast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setNotifications: (notifications, unreadCount) => {
    set({ notifications, unreadCount });
  },
}));
