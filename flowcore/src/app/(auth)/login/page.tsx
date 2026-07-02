import Link from "next/link";
import { Building2 } from "lucide-react";

export default function LoginPage() {
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
            Phase 1 交付登录页面骨架。真实账号、企业微信绑定和权限判断在 Phase 2 接入。
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">欢迎登录</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--fc-text-secondary)]">
            使用本地账号或企业微信进入 FlowCore。
          </p>
          <form className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">账号</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
                placeholder="请输入账号"
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">密码</span>
              <input
                className="mt-1 h-10 w-full rounded-md border border-[var(--fc-border)] px-3 outline-none focus:border-[var(--fc-primary)]"
                placeholder="不少于 8 位"
                type="password"
              />
            </label>
            <button
              className="h-10 w-full rounded-md bg-slate-300 px-4 text-sm font-medium text-slate-600"
              disabled
              type="button"
            >
              Phase 2 接入本地登录
            </button>
            <button
              className="h-10 w-full rounded-md border border-[var(--fc-border)] bg-slate-50 px-4 text-sm font-medium text-[var(--fc-text-secondary)]"
              disabled
              type="button"
            >
              Phase 2 接入企业微信
            </button>
          </form>
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            企业微信配置尚未接入。Phase 2 会完成绑定入口和停用账号拦截。
          </div>
          <Link
            className="mt-5 inline-flex text-sm font-medium text-[var(--fc-primary)]"
            href="/dashboard"
          >
            进入 Phase 1 页面骨架
          </Link>
        </div>
      </div>
    </section>
  );
}
