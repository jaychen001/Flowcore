import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import type { Permission } from "@/lib/permissions";
import { isDateInputValue } from "@/lib/projects/project-dates";

export type ActionResult = {
  ok: boolean;
  message: string;
};

export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(50)
});

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  permissions: z.string().max(300).optional()
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50),
  account: z.string().min(1).max(64),
  password: z.string().min(8).max(200).or(z.literal("")).optional(),
  departmentId: z.string().min(1),
  roleId: z.string().min(1),
  wecomUserid: z.string().max(100).optional()
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(8).max(200)
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  ownerId: z.string().min(1),
  plannedDeliveryDate: z.string().min(1).refine(isDateInputValue, "请输入合法日期。")
});

export const nodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  plannedDate: z.string().min(1).refine(isDateInputValue, "请输入合法日期。"),
  ownerId: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "disabled"])
});

export async function setRecordStatus(
  action: string,
  targetType: string,
  formData: FormData,
  update: (id: string) => Promise<void>,
  permissions: readonly Permission[] = ["master-data:manage"]
): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(permissions);
    const id = z.string().min(1).parse(formData.get("id"));

    await update(id);
    await writeAuditLog({ actorId: actor.id, action, targetType, targetId: id });
    revalidateMasterData();

    return { ok: true, message: "状态已更新。" };
  } catch (error) {
    return failure(error);
  }
}

export function parsePermissions(value?: string): string[] {
  return (value ?? "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function revalidateMasterData() {
  revalidatePath("/base-data");
  revalidatePath("/dashboard");
}

export function failure(error: unknown): ActionResult {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "操作失败，请重试。" };
}
