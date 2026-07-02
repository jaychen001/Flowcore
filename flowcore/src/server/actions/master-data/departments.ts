"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { departments } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import {
  departmentSchema,
  failure,
  revalidateMasterData,
  setRecordStatus,
  type ActionResult
} from "./shared";

export async function createDepartment(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = departmentSchema.parse(Object.fromEntries(formData));

    await db.insert(departments).values({
      id: randomUUID(),
      name: payload.name,
      type: payload.type,
      status: "active"
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "department_created",
      targetType: "department",
      targetId: payload.name
    });
    revalidateMasterData();

    return { ok: true, message: "部门已创建。" };
  } catch (error) {
    return failure(error);
  }
}

export async function updateDepartment(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = departmentSchema
      .extend({ id: z.string().min(1) })
      .parse(Object.fromEntries(formData));

    await db
      .update(departments)
      .set({ name: payload.name, type: payload.type, updatedAt: new Date() })
      .where(eq(departments.id, payload.id));
    await writeAuditLog({
      actorId: actor.id,
      action: "department_updated",
      targetType: "department",
      targetId: payload.id
    });
    revalidateMasterData();

    return { ok: true, message: "部门已保存。" };
  } catch (error) {
    return failure(error);
  }
}

export async function disableDepartment(formData: FormData): Promise<ActionResult> {
  return setRecordStatus("department_disabled", "department", formData, async (id) => {
    await db
      .update(departments)
      .set({ status: "disabled", updatedAt: new Date() })
      .where(eq(departments.id, id));
  });
}
