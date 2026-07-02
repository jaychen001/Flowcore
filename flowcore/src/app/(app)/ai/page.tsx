import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";

export default function AiPanelPage() {
  return (
    <PageShell
      description="P1 辅助建议面板，只能建议分类、影响部门、复发候选和通知摘要，必须人工确认。"
      eyebrow="SCREEN-010"
      title="AI 建议面板"
    >
      <FeedbackPanel
        description="AI 服务未接入时不影响 P0 主流程。Phase 10 才实现建议生成和人工确认。"
        kind="no-access"
        title="AI 建议尚未启用"
      />
    </PageShell>
  );
}
