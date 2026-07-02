import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";

export default function BaseDataPage() {
  return (
    <PageShell
      description="维护人员、部门、角色、项目和导入入口。Phase 3 接入 Excel 解析和引用保护。"
      eyebrow="SCREEN-008"
      title="基础数据管理"
      actions={
        <Link
          className="rounded-md bg-[var(--fc-primary)] px-3 py-2 text-sm font-medium text-white"
          href="/import-jobs/sample"
        >
          查看导入结果
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        {["人员", "部门", "角色", "项目"].map((label) => (
          <div className="rounded-md border border-[var(--fc-border)] bg-white p-4" key={label}>
            <h2 className="text-sm font-semibold">{label}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fc-text-secondary)]">
              等待 Phase 3 接入维护、停用和导入。
            </p>
          </div>
        ))}
      </div>
      <FeedbackPanel
        description="导入模板和错误报告生成会在 Phase 3 实现。"
        kind="no-access"
        title="导入能力尚未接入"
      />
    </PageShell>
  );
}
