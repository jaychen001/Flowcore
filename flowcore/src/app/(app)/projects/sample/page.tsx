import { PageShell } from "@/components/layout/page-shell";
import { DataTable } from "@/components/ui/data-table";
import { FeedbackPanel } from "@/components/ui/feedback";
import { StatusBadge } from "@/components/ui/status";

type NodeRow = {
  id: string;
  name: string;
  owner: string;
  status: "open" | "in-progress" | "done" | "overdue";
};

const rows: NodeRow[] = [
  {
    id: "node-template",
    name: "默认节点模板",
    owner: "Phase 3 接入",
    status: "open"
  }
];

export default function ProjectDetailPage() {
  return (
    <PageShell
      description="查看项目节点、关联问题和风险记录。当前页面只提供详情结构，项目数据在后续 Phase 接入。"
      eyebrow="SCREEN-003"
      title="项目详情"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <DataTable
          columns={[
            { key: "name", header: "节点", render: (row) => row.name },
            { key: "owner", header: "负责人", render: (row) => row.owner },
            {
              key: "status",
              header: "状态",
              render: (row) => <StatusBadge status={row.status} />
            }
          ]}
          emptyText="还没有项目节点"
          getRowKey={(row) => row.id}
          rows={rows}
        />
        <FeedbackPanel
          description="关联问题和风险记录会在问题闭环接入后显示。"
          kind="empty"
          title="暂无风险记录"
        />
      </div>
    </PageShell>
  );
}
