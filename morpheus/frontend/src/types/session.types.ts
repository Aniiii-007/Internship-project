export type SessionStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  topic: string | null;
  status: SessionStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  mediasoupRoomId: string | null;
  createdAt: string;
  // from joined query (getSession)
  tutorName?: string;
  subjectName?: string;
  callEvents?: CallEvent[];
}

export interface CallEvent {
  eventType: string;
  createdAt: string;
  userName: string;
}
