import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel, SkeletonBlock } from "@/components/ui/feedback";
import { RiskBadge } from "@/components/ui/status";

export default function DashboardPage() {
  return (
    <PageShell
      description="默认首页，后续接入项目、节点、问题和风险计算。当前 Phase 只交付页面结构和状态组件。"
      eyebrow="SCREEN-002"
      title="项目看板"
      actions={
        <Link
          className="rounded-md bg-[var(--fc-primary)] px-3 py-2 text-sm font-medium text-white"
          href="/base-data"
        >
          导入项目 Excel
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        {["项目总数", "高风险项目", "逾期节点", "未关闭问题"].map((label) => (
          <div
            className="rounded-md border border-[var(--fc-border)] bg-white p-4 shadow-[var(--fc-shadow-sm)]"
            key={label}
          >
            <div className="text-sm text-[var(--fc-text-secondary)]">{label}</div>
            <div className="mt-3 text-sm font-medium text-[var(--fc-text-muted)]">等待数据接入</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <FeedbackPanel
          action={
            <Link
              className="rounded-md border border-[var(--fc-border)] px-3 py-2 text-sm font-medium"
              href="/base-data"
            >
              维护项目基础数据
            </Link>
          }
          description="Phase 3 完成项目导入后，这里会显示项目卡片和列表视图。"
          kind="empty"
          title="还没有项目数据"
        />
        <div className="rounded-md border border-[var(--fc-border)] bg-white p-5 shadow-[var(--fc-shadow-sm)]">
          <h2 className="text-sm font-semibold">风险表达样例</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <RiskBadge level="normal" />
            <RiskBadge level="watch" />
            <RiskBadge level="high" />
            <RiskBadge level="blocked" />
          </div>
        </div>
      </div>
      <SkeletonBlock />
    </PageShell>
  );
}
