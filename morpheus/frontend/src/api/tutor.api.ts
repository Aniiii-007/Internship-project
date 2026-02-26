/*import api from "./axios";

// ─── Tutor Connection API ─────────────────────────────────────────────────────

export const tutorConnectionApi = {
  /** Get all incoming connection requests */
 /* getRequests: async () => {
    const response = await api.get("/api/connections");
    return response.data;
  },

  /** Accept a connection request */
 /* accept: async (connectionId: string) => {
    const response = await api.patch(`/api/connections/${connectionId}/accept`);
    return response.data;
  },*/
 /* accept: async (connectionId: string) => {
 /* const response = await api.patch(`/api/connections/${connectionId}`, {
    status: "accepted",
  });
  return response.data;
} ,

  /** Reject a connection request */
 /* reject: async (connectionId: string) => {
    const response = await api.patch(`/api/connections/${connectionId}/reject`);
    return response.data;
  },
};*/

import api from "./axios";

// ─── Tutor Connection API ─────────────────────────────────────────────────────

export const tutorConnectionApi = {
  /** Get all incoming connection requests */
  getRequests: async () => {
    const response = await api.get("/api/connections");
    return response.data;
  },

  /** Accept a connection request */
  accept: async (connectionId: string) => {
    const response = await api.patch(`/api/connections/${connectionId}`, {
      status: "accepted",
    });
    return response.data;
  },

  /** Reject a connection request */
  reject: async (connectionId: string) => {
    const response = await api.patch(`/api/connections/${connectionId}`, {
      status: "rejected",
    });
    return response.data;
  },
};

// ─── Tutor Profile API ────────────────────────────────────────────────────────

export const tutorProfileApi = {
  /** Get current tutor's own profile */
  getProfile: async () => {
    const response = await api.get("/api/tutor/profile");
    return response.data;
  },
};