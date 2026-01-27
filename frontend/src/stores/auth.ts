import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          const message =
            error.response?.data?.detail || 'Login failed. Please check your credentials.';
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: () => {
        api.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = api.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const user = await api.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false, user: null });
          api.clearToken();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
