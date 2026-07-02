import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, wecomAccounts } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import {
  createSessionForUser,
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS
} from "@/lib/session";
import {
  createPendingWecomBinding,
  getMissingWecomEnv,
  resolveWecomIdentity,
  WecomAuthError,
  WECOM_PENDING_COOKIE_NAME
} from "@/lib/wecom";

export async function GET(request: Request) {
  const missing = getMissingWecomEnv();

  if (missing.length > 0) {
    return NextResponse.json(
      {
        code: "wecom_not_configured",
        message: "企业微信登录尚未配置，请联系管理员配置自建应用和可信回调域名。",
        missing
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { code: "missing_code", message: "企业微信回调缺少授权 code。" },
      { status: 400 }
    );
  }

  try {
    const identity = await resolveWecomIdentity(code);
    const [binding] = await db
      .select({
        userId: users.id,
        status: users.status
      })
      .from(wecomAccounts)
      .innerJoin(users, eq(wecomAccounts.userId, users.id))
      .where(
        and(
          eq(wecomAccounts.corpId, identity.corpId),
          eq(wecomAccounts.wecomUserid, identity.wecomUserid)
        )
      )
      .limit(1);

    if (binding) {
      if (binding.status !== "active") {
        const response = NextResponse.redirect(
          new URL("/login?reason=account_disabled", request.url)
        );

        await writeAuditLog({
          actorId: binding.userId,
          action: "wecom_login_blocked",
          targetType: "user",
          targetId: binding.userId,
          afterSnapshot: { reason: "account_disabled" }
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

      const now = new Date();
      await db
        .update(wecomAccounts)
        .set({ lastLoginAt: now, updatedAt: now })
        .where(
          and(
            eq(wecomAccounts.corpId, identity.corpId),
            eq(wecomAccounts.wecomUserid, identity.wecomUserid)
          )
        );

      const session = await createSessionForUser(binding.userId, {
        ipAddress: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent")
      });
      const user = await getAuthenticatedUser(session.token);
      const response = NextResponse.redirect(
        new URL(user?.defaultRoute ?? "/dashboard", request.url)
      );

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

    const pending = createPendingWecomBinding(identity);
    const response = NextResponse.redirect(new URL("/wecom/bind", request.url));

    response.cookies.set(WECOM_PENDING_COOKIE_NAME, pending.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: pending.maxAge
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof WecomAuthError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        code: "wecom_authorization_failed",
        message: "企业微信授权失败，请稍后重试。"
      },
      { status: 502 }
    );
  }
}
