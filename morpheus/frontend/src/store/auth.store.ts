import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthState, User } from "../types/auth.types";

// ─── Auth Store ───────────────────────────────────────────────────────────────
// Persists user + token to localStorage so sessions survive page refresh.
// The refreshToken is in an HTTP-Only cookie (managed by the browser/server).

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, accessToken: string) =>
        set({ user, accessToken, isAuthenticated: true }),

      setAccessToken: (accessToken: string) =>
        set({ accessToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "morpheus-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and token — not transient loading state
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
