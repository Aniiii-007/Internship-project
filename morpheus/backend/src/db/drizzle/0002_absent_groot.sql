CREATE TYPE "public"."message_type" AS ENUM('text', 'schedule_request', 'schedule_response', 'session_link', 'system');--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" "message_type" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "topic" varchar(255);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "grade" varchar(50);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "school_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tutor_tests" ADD COLUMN "questions" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tutor_tests" ADD COLUMN "total_marks" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "college_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "marks" varchar(50);--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "degree_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "dob" date;--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "city" varchar(255);--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "intro_video_url" text;--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "college_id_url" text;