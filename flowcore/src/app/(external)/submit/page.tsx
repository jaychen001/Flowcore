export default function ExternalSubmitPage() {
  return (
    <section className="overflow-hidden rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
      <div className="p-5 pb-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fc-primary)]">
          SCREEN-007
        </p>
        <h1 className="mt-1 text-lg font-semibold">现场问题提交系统</h1>
        <p className="mt-1 text-sm leading-6 text-[var(--fc-text-secondary)]">
          移动端一等体验。Phase 5 接入登录、项目权限、附件强制和高风险创建。
        </p>
      </div>
      <form className="grid gap-4 p-5">
        {["客户单位", "关联项目", "问题类型", "问题标题", "联系人", "手机号"].map((label) => (
          <label className="grid gap-1 text-sm font-medium" key={label}>
            {label}
            <input
              className="h-11 rounded-md border border-[var(--fc-border)] px-3 font-normal outline-none focus:border-[var(--fc-primary)]"
              placeholder={`请输入${label}`}
              type="text"
            />
          </label>
        ))}
        <label className="grid gap-1 text-sm font-medium">
          详细描述
          <textarea
            className="min-h-32 rounded-md border border-[var(--fc-border)] px-3 py-2 font-normal outline-none focus:border-[var(--fc-primary)]"
            placeholder="请描述问题发生场景和当前表现"
          />
        </label>
        <div className="rounded-md border border-dashed border-[var(--fc-border)] bg-[var(--fc-surface-muted)] p-4 text-sm text-[var(--fc-text-secondary)]">
          售后现场问题至少上传 1 张照片。上传能力在 Phase 5 接入。
        </div>
      </form>
      <footer className="sticky bottom-0 border-t border-[var(--fc-border)] bg-white/95 p-4 backdrop-blur">
        <button
          className="h-11 w-full rounded-md bg-slate-300 px-4 text-sm font-medium text-slate-600"
          disabled
          type="button"
        >
          Phase 5 接入现场提交
        </button>
      </footer>
    </section>
  );
}
