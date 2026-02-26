import api from "./axios";
import type {
  StudentOnboardingPayload,
  TutorOnboardingPayload,
  StudentProfile,
  TutorProfile,
  Subject,
} from "../../src/types/onboarding.types";
//../types/onboarding.types

// ─── Subjects API ─────────────────────────────────────────────────────────────

export const subjectsApi = {
  /** Get all available subjects (public, no auth needed) */
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get("/api/subjects");
    return response.data;
  },
};

// ─── Student API ──────────────────────────────────────────────────────────────

export const studentApi = {
  /** Complete student onboarding profile */
  completeProfile: async (
    payload: StudentOnboardingPayload
  ): Promise<{ message: string }> => {
    const response = await api.post("/api/user/complete-profile", payload);
    return response.data;
  },

  /** Get current student's full profile */
  getProfile: async (): Promise<StudentProfile> => {
    const response = await api.get("/api/user/profile");
    return response.data;
  },
};

// ─── Tutor API ────────────────────────────────────────────────────────────────

export const tutorApi = {
  /**
   * Complete tutor onboarding — uses FormData for file uploads.
   * Backend expects multipart/form-data.
   */
  completeProfile: async (
    payload: TutorOnboardingPayload
  ): Promise<{ message: string }> => {
    const formData = new FormData();

    formData.append("education", payload.education);
    formData.append("collegeName", payload.collegeName);
    formData.append("marks", payload.marks);
    formData.append("degreeName", payload.degreeName);
    formData.append("dob", payload.dob);
    formData.append("city", payload.city);
    formData.append("experienceYears", String(payload.experienceYears));
    formData.append("introVideo", payload.introVideo);
    formData.append("collegeIdCard", payload.collegeIdCard);
    formData.append("subjects", JSON.stringify(payload.subjects));

    const response = await api.post("/api/tutor/complete-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /** Get current tutor's profile */
  getProfile: async (): Promise<TutorProfile> => {
    const response = await api.get("/api/tutor/profile");
    return response.data;
  },
};
