/*import api from "./axios";

export const adminApi = {
  /** Get all tutors with optional status filter */
 /* getTutors: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/api/admin/tutors", { params });
    return response.data;
  },

  /** Approve a tutor */
  /*approveTutor: async (tutorId: string) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/approve`);
    return response.data;
  },

  /** Reject a tutor */
 /* rejectTutor: async (tutorId: string) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/reject`);
    return response.data;
  },

  /** Suspend a tutor */
  /*suspendTutor: async (tutorId: string) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/suspend`);
    return response.data;
  },

  /** Get all students */
 /* getStudents: async () => {
    const response = await api.get("/api/admin/students");
    return response.data;
  },

  /** Get platform stats */
 /* getStats: async () => {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },
}/*;*/






/**The below code is written while fixing the issue of admin panel issue:adjusting the frontend on basis of backend apis */
/*import api from "./axios";

export const adminApi = {
  /** GET /api/admin/pending-tutors — fetch all pending tutors */
 /* getPendingTutors: async () => {
    const response = await api.get("/api/admin/tutors/pending");     // /api/admin/pending-tutors   code given by claude
    return response.data;
  },

  /** GET /api/admin/tutors/:id — detailed view of a specific tutor */
 /* getTutorById: async (tutorId: string) => {
    const response = await api.get(`/api/admin/tutors/${tutorId}`);
    return response.data;
  },

  /** PATCH /api/admin/tutors/:id/review — approve or reject a tutor */
 /* reviewTutor: async (
    tutorId: string,
    status: "approved" | "rejected" | "suspended",
    remarks?: string
  ) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/review`, {
      status,
      remarks,
    });
    return response.data;
  },

  /** GET /api/admin/students — get all students (if exists) */
 /* getStudents: async () => {
    const response = await api.get("/api/admin/students");
    return response.data;
  },

  /** GET /api/admin/stats — platform stats (if exists) */
 /* getStats: async () => {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },
};*/


//The below code is written for solving issue of tutors not found on admin panel

import api from "./axios";

export const adminApi = {
  /** GET /api/admin/tutors/pending — fetch all pending tutors */
  getPendingTutors: async () => {
    const response = await api.get("/api/admin/tutors/pending");
    return response.data;
  },

  /** GET /api/admin/tutors/:id — detailed view of a specific tutor */
  getTutorById: async (tutorId: string) => {
    const response = await api.get(`/api/admin/tutors/${tutorId}`);
    return response.data;
  },

  /** PATCH /api/admin/tutors/:id/review — approve or reject a tutor */
  reviewTutor: async (
    tutorId: string,
    status: "approved" | "rejected",
    remarks?: string
  ) => {
    const response = await api.patch(`/api/admin/tutors/${tutorId}/review`, {
      status,
      remarks,
    });
    return response.data;
  },
};


