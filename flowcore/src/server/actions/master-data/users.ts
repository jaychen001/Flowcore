"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { userRoles, users } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import { hashPassword } from "@/lib/password";
import {
  createUserSchema,
  failure,
  revalidateMasterData,
  setRecordStatus,
  userSchema,
  type ActionResult
} from "./shared";

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = createUserSchema.parse(Object.fromEntries(formData));
    const userId = randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name: payload.name,
        account: payload.account,
        email: `${payload.account}@flowcore.local`,
        passwordHash: await hashPassword(payload.password),
        departmentId: payload.departmentId,
        status: "active",
        wecomUserid: payload.wecomUserid || null
      });
      await tx.insert(userRoles).values({ userId, roleId: payload.roleId });
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "user_created",
      targetType: "user",
      targetId: userId
    });
    revalidateMasterData();

    return { ok: true, message: "人员已创建。" };
  } catch (error) {
    return failure(error);
  }
}

export async function updateUser(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["master-data:manage"]);
    const payload = userSchema
      .extend({ id: z.string().min(1) })
      .parse(Object.fromEntries(formData));
    const updateValues: Partial<typeof users.$inferInsert> = {
      name: payload.name,
      account: payload.account,
      departmentId: payload.departmentId,
      wecomUserid: payload.wecomUserid || null,
      updatedAt: new Date()
    };

    if (payload.password) {
      updateValues.passwordHash = await hashPassword(payload.password);
    }

    await db.transaction(async (tx) => {
      await tx.update(users).set(updateValues).where(eq(users.id, payload.id));
      await tx.delete(userRoles).where(eq(userRoles.userId, payload.id));
      await tx.insert(userRoles).values({ userId: payload.id, roleId: payload.roleId });
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "user_updated",
      targetType: "user",
      targetId: payload.id
    });
    revalidateMasterData();

    return { ok: true, message: "人员已保存。" };
  } catch (error) {
    return failure(error);
  }
}

export async function disableUser(formData: FormData): Promise<ActionResult> {
  return setRecordStatus("user_disabled", "user", formData, async (id) => {
    await db
      .update(users)
      .set({ status: "disabled", updatedAt: new Date() })
      .where(eq(users.id, id));
  });
}
