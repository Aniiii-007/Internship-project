import type { Subject, SubjectLevel } from "./onboarding.types";

// ─── Tutor Discovery ──────────────────────────────────────────────────────────

export interface TutorSummary {
  id: string;
  userId: string;
  education: string;
  experienceYears: number;
  collegeName: string | null;
  degreeName: string | null;
  city: string | null;
  introVideoUrl: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  totalReviews: number;
  recommendationScore?: number;
  subjects: Array<{
    subjectId: string;
    level: SubjectLevel;
    subject: Subject;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TutorDetail extends TutorSummary {
  reviews: Review[];
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    user: {
      name: string;
    };
  };
}

// ─── Search & Pagination ──────────────────────────────────────────────────────

export interface SearchParams {
  page?: number;
  limit?: number;
  subjectName?: string;
  level?: SubjectLevel;
  minExperience?: number;
  minRating?: number;
}

export interface PaginatedTutors {
  tutors: TutorSummary[];
  total: number;
  page: number;
  limit: number;
}

// ─── Connections ──────────────────────────────────────────────────────────────

export type ConnectionStatus = "pending" | "accepted" | "rejected" | "blocked";

export interface Connection {
  id: string;
  studentId: string;
  tutorId: string;
  status: ConnectionStatus;
  createdAt: string;
  tutor?: TutorSummary;
}
