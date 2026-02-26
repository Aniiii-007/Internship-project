import api from "./axios";
import type { Session } from "../types/session.types";

export const sessionApi = {
  /** GET /api/sessions */
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get("/api/sessions");
    return response.data;
  },

  /** GET /api/sessions/:id */
  getSession: async (id: string): Promise<Session> => {
    const response = await api.get(`/api/sessions/${id}`);
    return response.data;
  },

  /** POST /api/sessions/:id/start — tutor only */
  startSession: async (id: string): Promise<Session> => {
    const response = await api.post(`/api/sessions/${id}/start`);
    return response.data.session;
  },

  /** POST /api/sessions/:id/complete */
  completeSession: async (id: string): Promise<Session> => {
    const response = await api.post(`/api/sessions/${id}/complete`);
    return response.data.session;
  },
};
