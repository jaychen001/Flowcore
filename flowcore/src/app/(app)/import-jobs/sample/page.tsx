import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";

export default function ImportResultPage() {
  return (
    <PageShell
      description="展示导入成功、失败行号、字段和错误报告下载。"
      eyebrow="SCREEN-009"
      title="导入结果"
    >
      <FeedbackPanel
        action={
          <Link
            className="rounded-md border border-[var(--fc-border)] px-3 py-2 text-sm font-medium"
            href="/base-data"
          >
            返回基础数据
          </Link>
        }
        description="Phase 3 会把成功条数、失败行号和错误报告接入这里。"
        kind="success"
        title="导入结果页结构已就绪"
      />
    </PageShell>
  );
}
