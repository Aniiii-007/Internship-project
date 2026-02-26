// ─── Subjects ─────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
}

export type SubjectLevel = "beginner" | "medium" | "advanced";

export interface SubjectSelection {
  subjectId: string;
  level: SubjectLevel;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface StudentOnboardingPayload {
  grade: string;
  schoolName: string;
  bio: string;
  subjects: SubjectSelection[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  bio: string | null;
  grade: string | null;
  schoolName: string | null;
  createdAt: string;
  subjects: Array<{
    subjectId: string;
    level: SubjectLevel;
    subject: Subject;
  }>;
}

// ─── Tutor ────────────────────────────────────────────────────────────────────

export interface TutorOnboardingPayload {
  education: string;
  collegeName: string;
  marks: string;
  degreeName: string;
  dob: string;
  city: string;
  experienceYears: number;
  introVideo: File;
  collegeIdCard: File;
  subjects: SubjectSelection[];
}

export interface TutorProfile {
  id: string;
  userId: string;
  education: string;
  experienceYears: number;
  collegeName: string | null;
  marks: string | null;
  degreeName: string | null;
  dob: string | null;
  city: string | null;
  introVideoUrl: string | null;
  collegeIdUrl: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  totalReviews: number;
  subjects: Array<{
    subjectId: string;
    level: SubjectLevel;
    subject: Subject;
  }>;
}
