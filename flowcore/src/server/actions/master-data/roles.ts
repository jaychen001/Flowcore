"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { roles } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import {
  failure,
  parsePermissions,
  revalidateMasterData,
  roleSchema,
  setRecordStatus,
  type ActionResult
} from "./shared";

export async function createRole(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = roleSchema.parse(Object.fromEntries(formData));

    await db.insert(roles).values({
      id: randomUUID(),
      name: payload.name,
      permissions: parsePermissions(payload.permissions),
      status: "active"
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "role_created",
      targetType: "role",
      targetId: payload.name
    });
    revalidateMasterData();

    return { ok: true, message: "角色已创建。" };
  } catch (error) {
    return failure(error);
  }
}

export async function updateRole(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = roleSchema
      .extend({ id: z.string().min(1) })
      .parse(Object.fromEntries(formData));

    await db
      .update(roles)
      .set({
        name: payload.name,
        permissions: parsePermissions(payload.permissions),
        updatedAt: new Date()
      })
      .where(eq(roles.id, payload.id));
    await writeAuditLog({
      actorId: actor.id,
      action: "role_updated",
      targetType: "role",
      targetId: payload.id
    });
    revalidateMasterData();

    return { ok: true, message: "角色已保存。" };
  } catch (error) {
    return failure(error);
  }
}

export async function disableRole(formData: FormData): Promise<ActionResult> {
  return setRecordStatus("role_disabled", "role", formData, async (id) => {
    await db
      .update(roles)
      .set({ status: "disabled", updatedAt: new Date() })
      .where(eq(roles.id, id));
  });
}
