import Link from "next/link";
import { Building2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="grid min-h-screen place-items-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)] md:grid-cols-[1fr_420px]">
        <div className="hidden bg-[var(--fc-sidebar)] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Building2 className="size-5" />
              FlowCore
            </div>
            <h1 className="mt-16 text-3xl font-semibold leading-tight">
              企业级项目风险
              <br />
              与变更管理平台
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/64">
            本地账号、企业微信绑定和角色入口统一在这里完成。
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">欢迎登录</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--fc-text-secondary)]">
            使用本地账号或企业微信进入 FlowCore。
          </p>
          <LoginForm nextPath={params.next ?? ""} reason={params.reason} />
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            企业微信回调已接入降级提示。未配置 CorpID、AgentID、Secret 和回调域名前不会创建账号。
          </div>
          <Link
            className="mt-5 inline-flex text-sm font-medium text-[var(--fc-primary)]"
            href="/dashboard"
          >
            登录后进入项目看板
          </Link>
        </div>
      </div>
    </section>
  );
}
