CREATE TYPE "public"."call_event_type" AS ENUM('joined', 'left', 'muted', 'unmuted', 'video_on', 'video_off', 'ended');--> statement-breakpoint
CREATE TABLE "call_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "call_event_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "call_events_session_idx" ON "call_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "call_events_user_idx" ON "call_events" USING btree ("user_id");