import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true, // ← NEW: true until we verify the token

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isLoading: false }); // ← stop loading after auth
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false }); // ← stop loading after clear
  },

  setLoading: (val) => set({ isLoading: val }), // ← NEW: manual control

  isAdmin: () => get().user?.role === 'admin',
}));