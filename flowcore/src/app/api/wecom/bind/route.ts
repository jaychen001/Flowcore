import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users, wecomAccounts } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { verifyPassword } from "@/lib/password";
import {
  createSessionForUser,
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS
} from "@/lib/session";
import { readPendingWecomBinding, WECOM_PENDING_COOKIE_NAME } from "@/lib/wecom";

const bindSchema = z.object({
  account: z.string().min(1).max(64),
  password: z.string().min(8).max(200)
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const pendingIdentity = readPendingWecomBinding(
    cookieStore.get(WECOM_PENDING_COOKIE_NAME)?.value
  );

  if (!pendingIdentity) {
    return NextResponse.json(
      { code: "wecom_binding_expired", message: "企业微信绑定状态已过期，请重新授权。" },
      { status: 401 }
    );
  }

  const payload = bindSchema.safeParse(await readJson(request));

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

  if (!user || !(await verifyPassword(payload.data.password, user.passwordHash))) {
    return NextResponse.json(
      { code: "invalid_credentials", message: "账号或密码错误，无法绑定企业微信。" },
      { status: 401 }
    );
  }

  if (user.status !== "active") {
    await writeAuditLog({
      actorId: user.id,
      action: "wecom_bind_blocked",
      targetType: "user",
      targetId: user.id,
      afterSnapshot: { reason: "account_disabled" }
    });

    return NextResponse.json(
      { code: "account_disabled", message: "账号已停用，不能绑定企业微信。" },
      { status: 403 }
    );
  }

  if (user.wecomUserid && user.wecomUserid !== pendingIdentity.wecomUserid) {
    return NextResponse.json(
      { code: "wecom_user_mismatch", message: "该系统人员已绑定其他企业微信身份。" },
      { status: 409 }
    );
  }

  const [existingBinding] = await db
    .select({ userId: wecomAccounts.userId })
    .from(wecomAccounts)
    .where(
      and(
        eq(wecomAccounts.corpId, pendingIdentity.corpId),
        eq(wecomAccounts.wecomUserid, pendingIdentity.wecomUserid)
      )
    )
    .limit(1);

  if (existingBinding && existingBinding.userId !== user.id) {
    return NextResponse.json(
      { code: "wecom_already_bound", message: "该企业微信身份已绑定其他系统人员。" },
      { status: 409 }
    );
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.wecomUserid, pendingIdentity.wecomUserid), ne(users.id, user.id)))
    .limit(1);

  if (existingUser) {
    return NextResponse.json(
      { code: "wecom_already_bound", message: "该企业微信身份已绑定其他系统人员。" },
      { status: 409 }
    );
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .insert(wecomAccounts)
      .values({
        id: randomUUID(),
        userId: user.id,
        corpId: pendingIdentity.corpId,
        wecomUserid: pendingIdentity.wecomUserid,
        lastLoginAt: now
      })
      .onConflictDoUpdate({
        target: [wecomAccounts.corpId, wecomAccounts.wecomUserid],
        set: {
          userId: user.id,
          lastLoginAt: now,
          updatedAt: now
        }
      });

    await tx
      .update(users)
      .set({
        wecomUserid: pendingIdentity.wecomUserid,
        updatedAt: now
      })
      .where(eq(users.id, user.id));
  });

  await writeAuditLog({
    actorId: user.id,
    action: "wecom_bound",
    targetType: "user",
    targetId: user.id,
    afterSnapshot: { corpId: pendingIdentity.corpId, wecomUserid: pendingIdentity.wecomUserid }
  });

  const session = await createSessionForUser(user.id, {
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent")
  });
  const authUser = await getAuthenticatedUser(session.token);

  const response = NextResponse.json({
    ok: true,
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
  response.cookies.set(WECOM_PENDING_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
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
