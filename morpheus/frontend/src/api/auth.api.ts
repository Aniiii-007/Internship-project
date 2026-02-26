import api from "./axios";
import type {
  SignupPayload,
  LoginPayload,
  LoginResponse,
  VerifyEmailPayload,
  ResendOtpPayload,
  RefreshResponse,
  User,
} from "../types/auth.types";

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Create a new user account (student or tutor).
   * Returns the created userId.
   */
  signup: async (payload: SignupPayload): Promise<{ userId: string }> => {
    const response = await api.post("/api/auth/signup", payload);
    return response.data;
  },

  /**
   * Verify email with 6-digit OTP.
   */
  verifyEmail: async (payload: VerifyEmailPayload): Promise<{ message: string }> => {
    const response = await api.post("/api/auth/verify-email", payload);
    return response.data;
  },

  /**
   * Request a new OTP if previous one expired.
   */
  resendOtp: async (payload: ResendOtpPayload): Promise<{ message: string }> => {
    const response = await api.post("/api/auth/resend-otp", payload);
    return response.data;
  },

  /**
   * Login with credentials. Sets refreshToken HTTP-Only cookie.
   * Returns accessToken + user data.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post("/api/auth/login", payload);
    return response.data;
  },

  /**
   * Exchange refresh cookie for a new access token.
   */
  refresh: async (): Promise<RefreshResponse> => {
    const response = await api.post("/api/auth/refresh");
    return response.data;
  },

  /**
   * Logout and clear refresh cookie.
   */
  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },

  /**
   * Fetch current authenticated user.
   */
  getMe: async (): Promise<User> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};