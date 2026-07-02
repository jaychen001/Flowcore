"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { projectNodes, projects } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireAnyPermission } from "@/lib/current-user";
import { buildDefaultProjectNodes } from "@/lib/projects/default-nodes";
import { refreshProjectRisk } from "@/lib/projects/project-risk";
import {
  failure,
  nodeSchema,
  projectSchema,
  revalidateMasterData,
  setRecordStatus,
  type ActionResult
} from "./shared";

export async function createProject(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["projects:manage"]);
    const payload = projectSchema.parse(Object.fromEntries(formData));
    const projectId = randomUUID();

    await db.transaction(async (tx) => {
      await tx.insert(projects).values({
        id: projectId,
        name: payload.name,
        ownerId: payload.ownerId,
        plannedDeliveryDate: payload.plannedDeliveryDate,
        status: "active",
        riskLevel: "normal"
      });
      await tx.insert(projectNodes).values(
        buildDefaultProjectNodes({
          projectId,
          ownerId: payload.ownerId,
          plannedDeliveryDate: payload.plannedDeliveryDate
        })
      );
    });
    await writeAuditLog({
      actorId: actor.id,
      action: "project_created",
      targetType: "project",
      targetId: projectId
    });
    revalidateMasterData();

    return { ok: true, message: "项目已创建，并生成 10 个默认节点。" };
  } catch (error) {
    return failure(error);
  }
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["projects:manage"]);
    const payload = projectSchema
      .extend({ id: z.string().min(1) })
      .parse(Object.fromEntries(formData));

    await db
      .update(projects)
      .set({
        name: payload.name,
        ownerId: payload.ownerId,
        plannedDeliveryDate: payload.plannedDeliveryDate,
        updatedAt: new Date()
      })
      .where(eq(projects.id, payload.id));
    await writeAuditLog({
      actorId: actor.id,
      action: "project_updated",
      targetType: "project",
      targetId: payload.id
    });
    revalidateMasterData();

    return { ok: true, message: "项目已保存。" };
  } catch (error) {
    return failure(error);
  }
}

export async function archiveProject(formData: FormData): Promise<ActionResult> {
  return setRecordStatus(
    "project_archived",
    "project",
    formData,
    async (id) => {
      await db
        .update(projects)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(projects.id, id));
    },
    ["projects:manage"]
  );
}

export async function updateProjectNode(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireAnyPermission(["projects:manage"]);
    const payload = nodeSchema.parse(Object.fromEntries(formData));

    await db
      .update(projectNodes)
      .set({
        name: payload.name,
        plannedDate: payload.plannedDate,
        ownerId: payload.ownerId || null,
        status: payload.status,
        updatedAt: new Date()
      })
      .where(eq(projectNodes.id, payload.id));
    const [node] = await db
      .select({ projectId: projectNodes.projectId })
      .from(projectNodes)
      .where(eq(projectNodes.id, payload.id))
      .limit(1);

    await writeAuditLog({
      actorId: actor.id,
      action: "project_node_updated",
      targetType: "project_node",
      targetId: payload.id
    });
    revalidateMasterData();

    if (node) {
      await refreshProjectRisk(node.projectId);
      revalidatePath(`/projects/${node.projectId}`);
    }

    return { ok: true, message: "项目节点已保存。" };
  } catch (error) {
    return failure(error);
  }
}
