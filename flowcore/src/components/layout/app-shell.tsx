"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { appNavItems } from "@/lib/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--fc-bg)] text-[var(--fc-text)]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 bg-[var(--fc-sidebar)] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="text-lg font-semibold">FlowCore</div>
          <p className="mt-1 text-xs leading-5 text-white/55">项目风险与变更闭环</p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <NavGroup items={appNavItems} pathname={pathname} />
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--fc-border)] bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <label className="relative block max-w-xl">
                <span className="sr-only">全局搜索</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--fc-text-muted)]" />
                <input
                  className="h-9 w-full rounded-md border border-[var(--fc-border)] bg-[var(--fc-surface-muted)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--fc-primary)] focus:bg-white"
                  placeholder="搜索项目、问题编号或负责人"
                  type="search"
                />
              </label>
            </div>
            <div className="hidden items-center gap-3 text-sm text-[var(--fc-text-secondary)] sm:flex">
              <span className="rounded-md border border-[var(--fc-border)] px-2 py-1">
                企业微信未配置
              </span>
              <button
                aria-label="通知"
                className="grid size-9 place-items-center rounded-md border border-[var(--fc-border)] bg-white text-[var(--fc-text-secondary)]"
                type="button"
              >
                <Bell className="size-4" />
              </button>
              <span className="font-medium text-[var(--fc-text)]">演示用户</span>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

type NavGroupProps = {
  items: typeof appNavItems;
  pathname: string;
};

function NavGroup({ items, pathname }: NavGroupProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
              active
                ? "bg-white text-[var(--fc-sidebar)]"
                : "text-white/72 hover:bg-white/10 hover:text-white"
            ].join(" ")}
            href={item.href}
            key={item.href}
            title={item.description}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
