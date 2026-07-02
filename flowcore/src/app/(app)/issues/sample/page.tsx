import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";
import { StatusBadge } from "@/components/ui/status";

export default function IssueDetailPage() {
  return (
    <PageShell
      description="处理研发评估、方案审批、部门待办、技术关闭和项目关闭。当前只交付详情页结构。"
      eyebrow="SCREEN-005"
      title="问题 / 变更详情"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="rounded-md border border-[var(--fc-border)] bg-white p-5 shadow-[var(--fc-shadow-sm)]">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="open" />
            <span className="text-sm text-[var(--fc-text-secondary)]">FC-待生成</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold">问题详情结构已就绪</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--fc-text-secondary)]">
            Phase 6 会接入研发响应、驳回、分派、方案提交和审批动作。
          </p>
        </article>
        <FeedbackPanel
          description="当前动作区会根据待办和状态流转显示可执行动作。"
          kind="loading"
          title="等待工作流接入"
        />
      </div>
    </PageShell>
  );
}
