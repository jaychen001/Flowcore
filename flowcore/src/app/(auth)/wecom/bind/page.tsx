import { Building2 } from "lucide-react";
import { WecomBindForm } from "@/components/auth/wecom-bind-form";

export default function WecomBindPage() {
  return (
    <section className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-md border border-[var(--fc-border)] bg-white p-6 shadow-[var(--fc-shadow-sm)] sm:p-8">
        <div className="flex items-center gap-3 text-lg font-semibold text-[var(--fc-text)]">
          <Building2 className="size-5 text-[var(--fc-primary)]" />
          FlowCore
        </div>
        <h1 className="mt-8 text-2xl font-semibold">绑定企业微信身份</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--fc-text-secondary)]">
          企业微信首次登录必须绑定已有系统人员账号。系统不会自动创建人员。
        </p>
        <WecomBindForm />
      </div>
    </section>
  );
}
