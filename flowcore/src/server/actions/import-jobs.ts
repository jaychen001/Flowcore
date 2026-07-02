"use server";

import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  departments,
  importJobs,
  projectNodes,
  projects,
  roles,
  userRoles,
  users
} from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import { parseExcelFile } from "@/lib/imports/excel-parser";
import { isImportType, type ImportStatus } from "@/lib/imports/import-types";
import {
  validateImportRows,
  type ValidDepartmentRow,
  type ValidImportRow,
  type ValidProjectRow,
  type ValidRoleRow,
  type ValidUserRow
} from "@/lib/imports/import-validator";
import { hashPassword } from "@/lib/password";
import { buildDefaultProjectNodes } from "@/lib/projects/default-nodes";
import type { Permission } from "@/lib/permissions";

export type ImportActionResult = {
  ok: boolean;
  message: string;
  jobId?: string;
};

export async function runImport(formData: FormData): Promise<ImportActionResult> {
  const importTypeValue = String(formData.get("importType") ?? "");
  const fileValue = formData.get("file");

  if (!isImportType(importTypeValue)) {
    return { ok: false, message: "请选择有效的导入类型。" };
  }

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { ok: false, message: "请选择 Excel 文件。" };
  }

  try {
    const actor = await requireAnyPermission(getImportPermissions(importTypeValue));
    const [rows, context] = await Promise.all([parseExcelFile(fileValue), buildImportContext()]);
    const validation = validateImportRows(importTypeValue, rows, context);
    const appliedCount = await applyValidRows(validation.validRows);
    const errors = validation.errors;
    const failedCount = errors.length;
    const status = getImportStatus(appliedCount, failedCount);
    const jobId = randomUUID();

    await db.insert(importJobs).values({
      id: jobId,
      importType: importTypeValue,
      fileName: fileValue.name,
      status,
      successCount: appliedCount,
      failedCount,
      errors,
      errorReportUrl: failedCount > 0 ? `/api/import-jobs/${jobId}/error-report` : null,
      createdBy: actor.id
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "import_job_created",
      targetType: "import_job",
      targetId: jobId,
      afterSnapshot: { importType: importTypeValue, successCount: appliedCount, failedCount }
    });
    revalidatePath("/base-data");
    revalidatePath(`/import-jobs/${jobId}`);

    return {
      ok: failedCount === 0,
      message:
        failedCount === 0
          ? `导入成功 ${appliedCount} 行。`
          : `导入完成：成功 ${appliedCount} 行，失败 ${failedCount} 项。`,
      jobId
    };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "导入失败，请检查文件后重试。" };
  }
}

async function buildImportContext() {
  const [departmentRows, roleRows, userRows, projectRows] = await Promise.all([
    db
      .select({ id: departments.id, name: departments.name, status: departments.status })
      .from(departments)
      .orderBy(asc(departments.name)),
    db
      .select({ id: roles.id, name: roles.name, status: roles.status })
      .from(roles)
      .orderBy(asc(roles.name)),
    db
      .select({ id: users.id, name: users.name, account: users.account, status: users.status })
      .from(users)
      .orderBy(asc(users.name)),
    db.select({ name: projects.name }).from(projects).orderBy(asc(projects.name))
  ]);

  return {
    departments: departmentRows,
    roles: roleRows,
    users: userRows,
    projectNames: projectRows.map((project) => project.name)
  };
}

async function applyValidRows(rows: ValidImportRow[]): Promise<number> {
  let appliedCount = 0;

  for (const row of rows) {
    if ("type" in row) {
      await applyDepartmentRow(row);
    } else if ("permissions" in row) {
      await applyRoleRow(row);
    } else if ("password" in row) {
      await applyUserRow(row);
    } else {
      await applyProjectRow(row);
    }

    appliedCount += 1;
  }

  return appliedCount;
}

async function applyDepartmentRow(row: ValidDepartmentRow) {
  await db.insert(departments).values({
    id: randomUUID(),
    name: row.name,
    type: row.type,
    status: "active"
  });
}

async function applyRoleRow(row: ValidRoleRow) {
  await db.insert(roles).values({
    id: randomUUID(),
    name: row.name,
    permissions: row.permissions,
    status: "active"
  });
}

async function applyUserRow(row: ValidUserRow) {
  const userId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      name: row.name,
      account: row.account,
      email: `${row.account}@flowcore.local`,
      passwordHash: await hashPassword(row.password),
      departmentId: row.departmentId,
      status: "active",
      wecomUserid: row.wecomUserid
    });
    await tx.insert(userRoles).values({ userId, roleId: row.roleId });
  });
}

async function applyProjectRow(row: ValidProjectRow) {
  const projectId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(projects).values({
      id: projectId,
      name: row.name,
      ownerId: row.ownerId,
      plannedDeliveryDate: row.plannedDeliveryDate,
      status: "active",
      riskLevel: "normal"
    });
    await tx.insert(projectNodes).values(
      buildDefaultProjectNodes({
        projectId,
        ownerId: row.ownerId,
        plannedDeliveryDate: row.plannedDeliveryDate
      })
    );
  });
}

function getImportPermissions(importType: string): readonly Permission[] {
  return importType === "projects" ? ["projects:manage"] : ["master-data:manage"];
}

function getImportStatus(successCount: number, failedCount: number): ImportStatus {
  if (failedCount === 0) {
    return "success";
  }

  return successCount > 0 ? "partial" : "failed";
}
