import { create } from 'zustand';
import { User, Notification } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  activeMode: 'rider' | 'driver' | 'admin';
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setActiveMode: (mode: 'rider' | 'driver' | 'admin') => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

export const useStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('coride_token'),
  activeMode: (localStorage.getItem('coride_mode') as any) || 'rider',
  notifications: [],
  unreadCount: 0,
  isLoading: true,

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
