import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FeedbackPanel } from "@/components/ui/feedback";
import { canAccessAppPath } from "@/lib/navigation";
import { getAuthenticatedUser, SESSION_COOKIE_NAME } from "@/lib/session";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-flowcore-pathname") ?? "/dashboard";
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await getAuthenticatedUser(token).catch(() => null) : null;

  if (!user) {
    redirect(`/login?reason=session_required&next=${encodeURIComponent(pathname)}`);
  }

  if (!canAccessAppPath(pathname, user.permissions)) {
    return (
      <AppShell permissions={user.permissions} userName={user.name}>
        <FeedbackPanel
          description="当前账号角色没有访问此模块的权限。请切换有权限的账号，或联系管理员调整角色。"
          kind="no-access"
          title="没有访问权限"
        />
      </AppShell>
    );
  }

  return (
    <AppShell permissions={user.permissions} userName={user.name}>
      {children}
    </AppShell>
  );
}
