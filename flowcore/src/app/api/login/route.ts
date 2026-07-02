import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { createSessionForUser, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { getAuthenticatedUser } from "@/lib/session";

const loginSchema = z.object({
  account: z.string().min(1).max(64),
  password: z.string().min(8).max(200)
});

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await readJson(request));

  if (!payload.success) {
    return NextResponse.json(
      { code: "invalid_input", message: "请输入有效账号和不少于 8 位的密码。" },
      { status: 400 }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.account, payload.data.account))
    .limit(1);

  if (!user) {
    await writeAuditLog({
      action: "login_failed",
      targetType: "user",
      targetId: payload.data.account,
      afterSnapshot: { reason: "account_not_found" }
    });

    return NextResponse.json(
      { code: "invalid_credentials", message: "账号或密码错误。" },
      { status: 401 }
    );
  }

  if (user.status !== "active") {
    await writeAuditLog({
      actorId: user.id,
      action: "login_blocked",
      targetType: "user",
      targetId: user.id,
      afterSnapshot: { reason: "account_disabled" }
    });

    return NextResponse.json(
      { code: "account_disabled", message: "账号已停用，请联系管理员。" },
      { status: 403 }
    );
  }

  const passwordValid = await verifyPassword(payload.data.password, user.passwordHash);

  if (!passwordValid) {
    await writeAuditLog({
      actorId: user.id,
      action: "login_failed",
      targetType: "user",
      targetId: user.id,
      afterSnapshot: { reason: "password_mismatch" }
    });

    return NextResponse.json(
      { code: "invalid_credentials", message: "账号或密码错误。" },
      { status: 401 }
    );
  }

  const session = await createSessionForUser(user.id, {
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent")
  });
  const authUser = await getAuthenticatedUser(session.token);

  await writeAuditLog({
    actorId: user.id,
    action: "login_success",
    targetType: "user",
    targetId: user.id
  });

  const response = NextResponse.json({
    user: authUser,
    defaultRoute: authUser?.defaultRoute ?? "/dashboard"
  });

  response.cookies.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: session.expiresAt
  });

  return response;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
