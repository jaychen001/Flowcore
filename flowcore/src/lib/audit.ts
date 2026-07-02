import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";

export type AuditPayload = {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
};

export async function writeAuditLog(payload: AuditPayload): Promise<void> {
  await db.insert(auditLogs).values({
    id: randomUUID(),
    actorId: payload.actorId ?? null,
    action: payload.action,
    targetType: payload.targetType,
    targetId: payload.targetId ?? null,
    beforeSnapshot: payload.beforeSnapshot ?? null,
    afterSnapshot: payload.afterSnapshot ?? null
  });
}
