import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/layout/mobile-shell";
import { FeedbackPanel } from "@/components/ui/feedback";
import { hasPermission } from "@/lib/permissions";
import { getAuthenticatedUser, SESSION_COOKIE_NAME } from "@/lib/session";

export default async function ExternalLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await getAuthenticatedUser(token).catch(() => null) : null;

  if (!user) {
    redirect("/login?reason=session_required&next=%2Fsubmit");
  }

  if (!hasPermission(user.permissions, "external-submit:use")) {
    return (
      <MobileShell>
        <FeedbackPanel
          description="当前账号不是售后提交角色，不能访问现场问题提交入口。"
          kind="no-access"
          title="没有访问权限"
        />
      </MobileShell>
    );
  }

  return <MobileShell>{children}</MobileShell>;
}
