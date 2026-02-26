import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { studentApi, tutorApi, subjectsApi } from "../api/onboarding.api";
import type {
  StudentOnboardingPayload,
  TutorOnboardingPayload,
  Subject,
} from "../types/onboarding.types";
//../types/onboarding.types
// ─── useSubjects ──────────────────────────────────────────────────────────────

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subjectsApi
      .getAll()
      .then(setSubjects)
      .catch(() => setError("Failed to load subjects."))
      .finally(() => setIsLoading(false));
  }, []);

  return { subjects, isLoading, error };
}

// ─── useStudentOnboarding ─────────────────────────────────────────────────────

export function useStudentOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeProfile = async (payload: StudentOnboardingPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await studentApi.completeProfile(payload);
      navigate("/student/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { completeProfile, isLoading, error, clearError: () => setError(null) };
}

// ─── useTutorOnboarding ───────────────────────────────────────────────────────

export function useTutorOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const completeProfile = async (payload: TutorOnboardingPayload) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress for UX feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 85));
      }, 200);

      await tutorApi.completeProfile(payload);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => navigate("/tutor/dashboard"), 500);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeProfile,
    isLoading,
    error,
    uploadProgress,
    clearError: () => setError(null),
  };
}
