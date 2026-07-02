import { cookies } from "next/headers";
import { hasAnyPermission, type Permission } from "./permissions";
import { getAuthenticatedUser, SESSION_COOKIE_NAME, type AuthenticatedUser } from "./session";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getAuthenticatedUser(token).catch(() => null);
}

export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("请先登录后再操作。");
  }

  return user;
}

export async function requireAnyPermission(
  permissions: readonly Permission[]
): Promise<AuthenticatedUser> {
  const user = await requireCurrentUser();

  if (!hasAnyPermission(user.permissions, permissions)) {
    throw new Error("当前账号没有执行此操作的权限。");
  }

  return user;
}
