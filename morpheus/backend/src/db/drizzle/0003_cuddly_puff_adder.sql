ALTER TABLE "student_subjects" ADD CONSTRAINT "student_subjects_student_id_subject_id_pk" PRIMARY KEY("student_id","subject_id");--> statement-breakpoint
ALTER TABLE "tutor_subjects" ADD CONSTRAINT "tutor_subjects_tutor_id_subject_id_pk" PRIMARY KEY("tutor_id","subject_id");--> statement-breakpoint
ALTER TABLE "tutors" ADD COLUMN "remarks" text;