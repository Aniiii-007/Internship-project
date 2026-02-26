import api from "./axios";
import type {
  TutorSummary,
  TutorDetail,
  SearchParams,
  PaginatedTutors,
  Connection,
} from "../types/student.types";

// ─── Discovery API ────────────────────────────────────────────────────────────

export const discoveryApi = {
  /** Personalized tutor recommendations based on student subjects */
  getRecommendations: async (
    page = 1,
    limit = 10
  ): Promise<{ tutors: TutorSummary[]; total: number }> => {
    const response = await api.get("/api/user/recommendations", {
      params: { page, limit },
    });
    return response.data;
  },

  /** Search tutors with filters */
  searchTutors: async (params: SearchParams): Promise<PaginatedTutors> => {
    const response = await api.get("/api/user/search", { params });
    return response.data;
  },

  /** Get a single tutor's public profile */
  getTutorById: async (tutorId: string): Promise<TutorDetail> => {
    const response = await api.get(`/api/user/tutors/${tutorId}`);
    return response.data;
  },
};

// ─── Connection API ───────────────────────────────────────────────────────────

export const connectionApi = {
  /** Student sends a connection request to a tutor */
  sendRequest: async (
    tutorId: string
  ): Promise<{ message: string; connection: Connection }> => {
    const response = await api.post("/api/connections", { tutorId });
    return response.data;
  },

  /** Get all connections for current user */
  getAll: async (): Promise<Connection[]> => {
    const response = await api.get("/api/connections");
    return response.data;
  },
};
