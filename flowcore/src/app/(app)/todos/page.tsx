import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";

export default function TodosPage() {
  return (
    <PageShell
      description="按当前用户展示研发响应、方案提交、审批、部门处理和关闭待办。"
      eyebrow="SCREEN-006"
      title="我的待办"
    >
      <FeedbackPanel
        description="Phase 8 接入待办生成和筛选后，这里只展示当前用户可处理事项。"
        kind="empty"
        title="暂无待处理事项"
      />
    </PageShell>
  );
}
