import { create } from 'zustand';
import { User, Notification } from '../types';
import { api } from '../lib/api';

export type ThemeMode = 'dark' | 'light';

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('coride_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
};

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  activeMode: 'rider' | 'driver' | 'admin';
  theme: ThemeMode;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setActiveMode: (mode: 'rider' | 'driver' | 'admin') => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('coride_token'),
  activeMode: (localStorage.getItem('coride_mode') as any) || 'rider',
  theme: initialTheme,
  notifications: [],
  unreadCount: 0,
  isLoading: true,

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('coride_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('coride_theme', nextTheme);
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('coride_token', token);
    if (refreshToken) {
      localStorage.setItem('coride_refresh', refreshToken);
    }
    const defaultMode = user.is_admin ? 'admin' : user.is_driver ? 'driver' : 'rider';
    localStorage.setItem('coride_mode', defaultMode);
    set({ user, token, activeMode: defaultMode, isLoading: false });
    get().fetchNotifications();
  },

  setUser: (user) => set({ user }),

  setActiveMode: (mode) => {
    localStorage.setItem('coride_mode', mode);
    set({ activeMode: mode });
  },

  logout: () => {
    localStorage.removeItem('coride_token');
    localStorage.removeItem('coride_refresh');
    localStorage.removeItem('coride_mode');
    set({ user: null, token: null, notifications: [], unreadCount: 0, isLoading: false });
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('coride_token');
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }
    try {
      const user = await api.get<User>('/me');
      set({ user, isLoading: false });
      get().fetchNotifications();
    } catch {
      localStorage.removeItem('coride_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  fetchNotifications: async () => {
    if (!get().token) return;
    try {
      const notifs = await api.get<Notification[]>('/notifications');
      const unread = notifs.filter((n) => !n.read_at).length;
      set({ notifications: notifs, unreadCount: unread });
    } catch {
      // Ignore background notification fetch errors
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read_at).length,
        };
      });
    } catch (e) {
      console.error(e);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.post('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (e) {
      console.error(e);
    }
  },
}));
