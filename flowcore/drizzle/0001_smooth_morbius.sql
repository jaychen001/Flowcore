CREATE TYPE "public"."import_status" AS ENUM('success', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."import_type" AS ENUM('departments', 'roles', 'users', 'projects');--> statement-breakpoint
CREATE TYPE "public"."project_node_status" AS ENUM('not_started', 'in_progress', 'completed', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('normal', 'watch', 'high', 'blocked');--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"import_type" "import_type" NOT NULL,
	"file_name" text NOT NULL,
	"status" "import_status" NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_report_url" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"sequence" integer NOT NULL,
	"planned_date" date,
	"owner_id" text,
	"status" "project_node_status" DEFAULT 'not_started' NOT NULL,
	"blocked_issue_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"planned_delivery_date" date,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"risk_level" "risk_level" DEFAULT 'normal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_nodes" ADD CONSTRAINT "project_nodes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_nodes" ADD CONSTRAINT "project_nodes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "import_jobs_import_type_idx" ON "import_jobs" USING btree ("import_type");--> statement-breakpoint
CREATE INDEX "import_jobs_created_by_idx" ON "import_jobs" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "project_nodes_project_sequence_uidx" ON "project_nodes" USING btree ("project_id","sequence");--> statement-breakpoint
CREATE INDEX "project_nodes_project_id_idx" ON "project_nodes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_nodes_owner_id_idx" ON "project_nodes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");