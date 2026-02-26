import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  text,
  integer,
  index,
  uniqueIndex,
  jsonb,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "tutor",
  "admin",
]);

export const tutorStatusEnum = pgEnum("tutor_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "active",
  "completed",
  "cancelled",
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "accepted",
  "rejected",
  "blocked",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "aadhaar",
  "pan",
  "degree_certificate",
  "experience_letter",
  "other",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "schedule_request",
  "schedule_response",
  "session_link",
  "system",
]);


export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    role: userRoleEnum("role").notNull(),

    isVerified: boolean("is_verified").default(false),
    isBlocked: boolean("is_blocked").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);


export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    bio: text("bio"),
    grade: varchar("grade", { length: 50 }),
    schoolName: varchar("school_name", { length: 255 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("students_user_idx").on(table.userId),
  })
);


export const tutors = pgTable(
  "tutors",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    education: text("education").notNull(),
    experienceYears: integer("experience_years").default(0),

    collegeName: varchar("college_name", { length: 255 }),
    marks: varchar("marks", { length: 50 }),
    degreeName: varchar("degree_name", { length: 255 }),

    dob: date("dob"),
    city: varchar("city", { length: 255 }),
    introVideoUrl: text("intro_video_url"),
    collegeIdUrl: text("college_id_url"),

    status: tutorStatusEnum("status").default("pending"),

    remarks: text("remarks"), // Admin rejection/approval notes

    averageRating: integer("average_rating").default(0),
    totalReviews: integer("total_reviews").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("tutors_user_idx").on(table.userId),
  })
);


export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: uniqueIndex("subjects_name_idx").on(table.name),
  })
);


export const tutorSubjects = pgTable(
  "tutor_subjects",
  {
    tutorId: uuid("tutor_id")
      .references(() => tutors.id, { onDelete: "cascade" })
      .notNull(),

    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" })
      .notNull(),

    level: varchar("level", { length: 50 }).notNull(), // beginner | medium | advanced
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tutorId, table.subjectId] }),
    tutorIdx: index("tutor_subjects_tutor_idx").on(table.tutorId),
  })
);


export const studentSubjects = pgTable(
  "student_subjects",
  {
    studentId: uuid("student_id")
      .references(() => students.id, { onDelete: "cascade" })
      .notNull(),

    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" })
      .notNull(),

    level: varchar("level", { length: 50 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentId, table.subjectId] }),
    studentIdx: index("student_subjects_student_idx").on(table.studentId),
  })
);


export const tutorDocuments = pgTable(
  "tutor_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tutorId: uuid("tutor_id")
      .references(() => tutors.id, { onDelete: "cascade" })
      .notNull(),

    documentType: documentTypeEnum("document_type").notNull(),
    documentUrl: text("document_url").notNull(),

    isVerified: boolean("is_verified").default(false),

    uploadedAt: timestamp("uploaded_at").defaultNow(),
  },
  (table) => ({
    tutorIdx: index("tutor_documents_tutor_idx").on(table.tutorId),
  })
);


export const tutorTests = pgTable("tutor_tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // Array of MCQ/MSQ
  totalMarks: integer("total_marks").notNull(),
});

export const tutorTestAttempts = pgTable(
  "tutor_test_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tutorId: uuid("tutor_id")
      .references(() => tutors.id, { onDelete: "cascade" })
      .notNull(),

    testId: uuid("test_id")
      .references(() => tutorTests.id, { onDelete: "cascade" })
      .notNull(),

    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),

    attemptedAt: timestamp("attempted_at").defaultNow(),
  },
  (table) => ({
    tutorIdx: index("tutor_test_attempts_tutor_idx").on(table.tutorId),
  })
);


export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),

    tutorId: uuid("tutor_id")
      .references(() => tutors.id)
      .notNull(),

    subjectId: uuid("subject_id")
      .references(() => subjects.id)
      .notNull(),

    status: sessionStatusEnum("status").default("scheduled"),

    mediasoupRoomId: varchar("mediasoup_room_id", { length: 255 }),

    topic: varchar("topic", { length: 255 }),
    description: text("description"),

    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tutorIdx: index("sessions_tutor_idx").on(table.tutorId),
    studentIdx: index("sessions_student_idx").on(table.studentId),
  })
);


export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: uuid("session_id")
      .references(() => sessions.id, { onDelete: "cascade" })
      .notNull(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),

    tutorId: uuid("tutor_id")
      .references(() => tutors.id)
      .notNull(),

    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tutorIdx: index("reviews_tutor_idx").on(table.tutorId),
  })
);


export const connections = pgTable(
  "connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),

    tutorId: uuid("tutor_id")
      .references(() => tutors.id)
      .notNull(),

    status: connectionStatusEnum("status").default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    studentIdx: index("connections_student_idx").on(table.studentId),
    tutorIdx: index("connections_tutor_idx").on(table.tutorId),
  })
);


//chating
export const conversationTypeEnum = pgEnum("conversation_type", [
  "student_tutor",
]);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),

  tutorId: uuid("tutor_id")
    .references(() => tutors.id, { onDelete: "cascade" })
    .notNull(),

  type: conversationTypeEnum("type").default("student_tutor"),

  lastMessageAt: timestamp("last_message_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
]);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),

  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),

  content: text("content").notNull(),

  type: messageTypeEnum("type").default("text").notNull(),
  metadata: jsonb("metadata"), // For session_id, status, etc.

  status: messageStatusEnum("status").default("sent"),

  isEdited: boolean("is_edited").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
});


// ─── Auth: Email Verification OTPs ───────────────────────────────────────────
export const emailVerificationOtps = pgTable(
  "email_verification_otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    otp: varchar("otp", { length: 6 }).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    used: boolean("used").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("otp_user_idx").on(table.userId),
  })
);


// ─── Auth: Refresh Tokens ─────────────────────────────────────────────────────
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Store SHA-256 hash of the token, never the raw token
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("refresh_tokens_user_idx").on(table.userId),
    tokenHashIdx: uniqueIndex("refresh_tokens_hash_idx").on(table.tokenHash),
  })
);


// ─── Video Call Events ────────────────────────────────────────────────────────
export const callEventTypeEnum = pgEnum("call_event_type", [
  "joined",
  "left",
  "muted",
  "unmuted",
  "video_on",
  "video_off",
  "ended",
]);

/**
 * Persists every in-call event for dashboard analytics and audit.
 * Lets you calculate: call duration, who muted when, who ended the call.
 */
export const callEvents = pgTable(
  "call_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: uuid("session_id")
      .references(() => sessions.id, { onDelete: "cascade" })
      .notNull(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    eventType: callEventTypeEnum("event_type").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("call_events_session_idx").on(table.sessionId),
    userIdx: index("call_events_user_idx").on(table.userId),
  })
);
