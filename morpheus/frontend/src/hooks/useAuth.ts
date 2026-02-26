import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";
import type {
  SignupPayload,
  LoginPayload,
  VerifyEmailPayload,
} from "../types/auth.types";
import api from "../api/axios";

// ─── useAuth Hook ─────────────────────────────────────────────────────────────
// Wraps the Zustand store and exposes clean async actions with error handling.

export function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ── Signup ────────────────────────────────────────────────────────────────

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.signup(payload);
      // Navigate to OTP verification, passing email via state
      navigate("/verify-email", { state: { email: payload.email } });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify Email ──────────────────────────────────────────────────────────

  const verifyEmail = async (payload: VerifyEmailPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(payload);
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const resendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resendOtp({ email });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────

  /*const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      setAuth(response.user, response.accessToken);

      // Route based on role
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (response.user.role === "tutor") {
        navigate("/tutor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  }; this login function is created before onBoarding issue was resolved */
  const login = async (payload: LoginPayload) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await authApi.login(payload);
    setAuth(response.user, response.accessToken);

    if (response.user.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (response.user.role === "student") {
      try {
        const profileRes = await api.get("/api/user/profile");
        console.log("Student profile response:", profileRes.data);
        if (profileRes.data?.studentProfile?.grade) {
          navigate("/student/dashboard");
        } else {
          navigate("/student/onboarding");
        }
      } catch (err: any) {
        console.log("Student profile error:", err?.response?.status, err?.response?.data);
        navigate("/student/onboarding");
      }
    }

    if (response.user.role === "tutor") {
      try {
        const profileRes = await api.get("/api/tutor/profile");
        console.log("Tutor profile response:", profileRes.data);
        if (profileRes.data?.tutorProfile?.education) {
          navigate("/tutor/dashboard");
        } else {
          navigate("/tutor/onboarding");
        }
      } catch (err: any) {
        console.log("Tutor profile error:", err?.response?.status, err?.response?.data);
        navigate("/tutor/onboarding");
      }
    }

  } catch (err) {
    const axiosError = err as AxiosError<{ message: string }>;
    setError(axiosError.response?.data?.message || "Invalid credentials.");
  } finally {
    setIsLoading(false);
  }
};



  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Even if server fails, clear local state
    } finally {
      clearAuth();
      setIsLoading(false);
      navigate("/login");
    }
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    signup,
    verifyEmail,
    resendOtp,
    login,
    logout,
    clearError,
  };
}
