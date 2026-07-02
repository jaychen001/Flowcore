import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { roles, sessions, userRoles, users } from "@/db/schema";
import { getDefaultRouteForRoles, getPermissionsForRoles } from "./permissions";

export const SESSION_COOKIE_NAME = "flowcore_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthenticatedUser = {
  id: string;
  name: string;
  account: string;
  status: "active" | "disabled";
  roleNames: string[];
  permissions: string[];
  defaultRoute: string;
};

export async function createSessionForUser(
  userId: string,
  metadata: { ipAddress?: string | null; userAgent?: string | null } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    id: randomUUID(),
    userId,
    token: hashSessionToken(token),
    expiresAt,
    ipAddress: metadata.ipAddress ?? null,
    userAgent: metadata.userAgent ?? null
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, hashSessionToken(token)));
}

export async function getAuthenticatedUser(token: string): Promise<AuthenticatedUser | null> {
  const [sessionRow] = await db
    .select({
      userId: users.id,
      name: users.name,
      account: users.account,
      status: users.status
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, hashSessionToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!sessionRow || sessionRow.status !== "active") {
    return null;
  }

  const roleRows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, sessionRow.userId), eq(roles.status, "active")));

  const roleNames = roleRows.map((row) => row.name);
  const permissions = getPermissionsForRoles(roleNames);

  return {
    id: sessionRow.userId,
    name: sessionRow.name,
    account: sessionRow.account,
    status: sessionRow.status,
    roleNames,
    permissions,
    defaultRoute: getDefaultRouteForRoles(roleNames)
  };
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
