CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'rejected', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('student_tutor');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('aadhaar', 'pan', 'degree_certificate', 'experience_letter', 'other');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tutor_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'tutor', 'admin');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"tutor_id" uuid NOT NULL,
	"status" "connection_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"tutor_id" uuid NOT NULL,
	"type" "conversation_type" DEFAULT 'student_tutor',
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"status" "message_status" DEFAULT 'sent',
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"tutor_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"tutor_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"status" "session_status" DEFAULT 'scheduled',
	"mediasoup_room_id" varchar(255),
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_subjects" (
	"student_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"level" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tutor_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"document_url" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_subjects" (
	"tutor_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"level" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutor_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"education" text NOT NULL,
	"experience_years" integer DEFAULT 0,
	"status" "tutor_status" DEFAULT 'pending',
	"average_rating" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_blocked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_documents" ADD CONSTRAINT "tutor_documents_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_test_attempts" ADD CONSTRAINT "tutor_test_attempts_tutor_id_tutors_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."tutors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_test_attempts" ADD CONSTRAINT "tutor_test_attempts_test_id_tutor_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tutor_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connections_student_idx" ON "connections" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "connections_tutor_idx" ON "connections" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "reviews_tutor_idx" ON "reviews" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "sessions_tutor_idx" ON "sessions" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "sessions_student_idx" ON "sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_subjects_student_idx" ON "student_subjects" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "students_user_idx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_name_idx" ON "subjects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tutor_documents_tutor_idx" ON "tutor_documents" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_subjects_tutor_idx" ON "tutor_subjects" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutor_test_attempts_tutor_idx" ON "tutor_test_attempts" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "tutors_user_idx" ON "tutors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");