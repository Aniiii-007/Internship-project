// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "tutor" | "admin";

// ─── Entities ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

// ─── Response Shapes ─────────────────────────────────────────────────────────

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// ─── Auth Store State ─────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
