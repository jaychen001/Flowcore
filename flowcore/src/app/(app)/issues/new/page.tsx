import { PageShell } from "@/components/layout/page-shell";

export default function NewIssuePage() {
  return (
    <PageShell
      description="生产装配和内部发现问题的轻量提交入口。真实创建事务在 Phase 5 实现。"
      eyebrow="REQ-003"
      title="提交问题"
    >
      <form className="grid max-w-3xl gap-4 rounded-md border border-[var(--fc-border)] bg-white p-5">
        {["项目", "来源", "问题标题", "问题位置", "影响判断"].map((label) => (
          <label className="grid gap-1 text-sm font-medium" key={label}>
            {label}
            <input
              className="h-10 rounded-md border border-[var(--fc-border)] px-3 font-normal outline-none focus:border-[var(--fc-primary)]"
              placeholder={`${label}将在后续 Phase 接入真实选项`}
              type="text"
            />
          </label>
        ))}
        <label className="grid gap-1 text-sm font-medium">
          问题描述
          <textarea
            className="min-h-28 rounded-md border border-[var(--fc-border)] px-3 py-2 font-normal outline-none focus:border-[var(--fc-primary)]"
            placeholder="描述问题发生场景、表现和影响"
          />
        </label>
        <button
          className="w-fit rounded-md bg-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
          disabled
          type="button"
        >
          Phase 5 接入提交问题
        </button>
      </form>
    </PageShell>
  );
}
