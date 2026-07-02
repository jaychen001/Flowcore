import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const projectStatusEnum = pgEnum("project_status", ["active", "archived"]);
export const projectNodeStatusEnum = pgEnum("project_node_status", [
  "not_started",
  "in_progress",
  "completed",
  "disabled"
]);
export const riskLevelEnum = pgEnum("risk_level", ["normal", "watch", "high", "blocked"]);
export const importTypeEnum = pgEnum("import_type", ["departments", "roles", "users", "projects"]);
export const importStatusEnum = pgEnum("import_status", ["success", "failed", "partial"]);

export type ImportErrorRow = {
  rowNumber: number;
  field: string;
  reason: string;
};

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    plannedDeliveryDate: date("planned_delivery_date").notNull(),
    status: projectStatusEnum("status").notNull().default("active"),
    riskLevel: riskLevelEnum("risk_level").notNull().default("normal"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("projects_owner_id_idx").on(table.ownerId),
    index("projects_status_idx").on(table.status)
  ]
);

export const projectNodes = pgTable(
  "project_nodes",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sequence: integer("sequence").notNull(),
    plannedDate: date("planned_date").notNull(),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    status: projectNodeStatusEnum("status").notNull().default("not_started"),
    blockedIssueCount: integer("blocked_issue_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("project_nodes_project_sequence_uidx").on(table.projectId, table.sequence),
    index("project_nodes_project_id_idx").on(table.projectId),
    index("project_nodes_owner_id_idx").on(table.ownerId)
  ]
);

export const importJobs = pgTable(
  "import_jobs",
  {
    id: text("id").primaryKey(),
    importType: importTypeEnum("import_type").notNull(),
    fileName: text("file_name").notNull(),
    status: importStatusEnum("status").notNull(),
    successCount: integer("success_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    errors: jsonb("errors").$type<ImportErrorRow[]>().notNull().default([]),
    errorReportUrl: text("error_report_url"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("import_jobs_import_type_idx").on(table.importType),
    index("import_jobs_created_by_idx").on(table.createdBy)
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id]
  }),
  nodes: many(projectNodes)
}));

export const projectNodesRelations = relations(projectNodes, ({ one }) => ({
  project: one(projects, {
    fields: [projectNodes.projectId],
    references: [projects.id]
  }),
  owner: one(users, {
    fields: [projectNodes.ownerId],
    references: [users.id]
  })
}));
