import type { ImportErrorRow } from "@/db/schema";

export const IMPORT_TYPES = ["departments", "roles", "users", "projects"] as const;

export type ImportType = (typeof IMPORT_TYPES)[number];
export type ImportStatus = "success" | "failed" | "partial";
export type ImportError = ImportErrorRow;

export const IMPORT_TYPE_LABELS = {
  departments: "部门",
  roles: "角色",
  users: "人员",
  projects: "项目"
} satisfies Record<ImportType, string>;

export const IMPORT_TEMPLATE_HEADERS = {
  departments: ["部门名称", "部门类型"],
  roles: ["角色名称", "权限"],
  users: ["人员姓名", "账号", "初始密码", "部门", "角色", "企业微信UserID"],
  projects: ["项目名称", "项目负责人账号", "计划交付日"]
} satisfies Record<ImportType, string[]>;

export function isImportType(value: string): value is ImportType {
  return (IMPORT_TYPES as readonly string[]).includes(value);
}
