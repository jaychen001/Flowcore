import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { FeedbackPanel } from "@/components/ui/feedback";
import { StatusBadge } from "@/components/ui/status";

type IssueRow = {
  id: string;
  title: string;
  status: "open" | "in-progress" | "done" | "overdue";
  owner: string;
};

const rows: IssueRow[] = [
  {
    id: "workflow-shell",
    title: "问题闭环页面结构",
    status: "open",
    owner: "Phase 5 接入"
  }
];

export default function IssuesPage() {
  return (
    <PageShell
      description="统一查看、筛选并进入问题单。Phase 5 开始接入真实问题数据和提交流程。"
      eyebrow="SCREEN-004"
      title="问题 / 变更中心"
      actions={
        <Link
          className="rounded-md bg-[var(--fc-primary)] px-3 py-2 text-sm font-medium text-white"
          href="/issues/new"
        >
          提交问题
        </Link>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        {["待研发响应", "研发评估中", "部门处理中", "待关闭"].map((label) => (
          <div className="rounded-md border border-[var(--fc-border)] bg-white p-4" key={label}>
            <div className="text-sm text-[var(--fc-text-secondary)]">{label}</div>
            <div className="mt-2 text-sm font-medium text-[var(--fc-text-muted)]">等待流程接入</div>
          </div>
        ))}
      </div>
      <DataTable
        columns={[
          {
            key: "title",
            header: "问题",
            render: (row) => (
              <Link className="font-medium text-[var(--fc-primary)]" href="/issues/sample">
                {row.title}
              </Link>
            )
          },
          { key: "owner", header: "负责人", render: (row) => row.owner },
          {
            key: "status",
            header: "状态",
            render: (row) => <StatusBadge status={row.status} />
          }
        ]}
        emptyText="暂无问题"
        getRowKey={(row) => row.id}
        rows={rows}
      />
      <FeedbackPanel
        description="筛选无结果时用这个状态，而不是显示空白表格。"
        kind="empty"
        title="筛选无结果"
      />
    </PageShell>
  );
}
