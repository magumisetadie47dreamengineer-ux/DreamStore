"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "auth-storage";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user?.id),
        }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        queueMicrotask(() => {
          if (error) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(STORAGE_KEY);
            }
            useAuthStore.setState({
              user: null,
              isAuthenticated: false,
              _hasHydrated: true,
            });
            return;
          }

          const hasUser = Boolean(state?.user?.id);
          useAuthStore.setState({
            user: hasUser ? state.user : null,
            isAuthenticated: hasUser,
            _hasHydrated: true,
          });
        });
      },
    }
  )
);
