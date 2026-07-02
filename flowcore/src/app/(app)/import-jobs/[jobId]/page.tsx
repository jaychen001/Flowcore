import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { FeedbackPanel } from "@/components/ui/feedback";
import { getCurrentUser } from "@/lib/current-user";
import { getImportJobDetail } from "@/lib/master-data/queries";
import { hasPermission } from "@/lib/permissions";

type ImportJobPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function ImportJobPage({ params }: ImportJobPageProps) {
  const { jobId } = await params;
  const user = await getCurrentUser();
  const permissions = user?.permissions ?? [];
  const job = await getImportJobDetail(jobId, {
    userId: user?.id ?? "",
    canManageMasterData: hasPermission(permissions, "master-data:manage"),
    canManageProjects: hasPermission(permissions, "projects:manage")
  });

  if (!job) {
    notFound();
  }

  return (
    <PageShell
      description="展示导入成功、失败行号、字段和错误报告下载。"
      eyebrow="SCREEN-009"
      title="导入结果"
      actions={
        <Link
          className="rounded-md border border-[var(--fc-border)] px-3 py-2 text-sm font-medium"
          href="/base-data"
        >
          返回基础数据
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="导入类型" value={job.importType} />
        <Summary label="成功行数" value={String(job.successCount)} />
        <Summary label="失败项数" value={String(job.failedCount)} />
      </div>
      {job.errors.length > 0 ? (
        <div className="rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--fc-border)] p-4">
            <h2 className="text-sm font-semibold">失败明细</h2>
            <a
              className="rounded-md border border-[var(--fc-border)] px-3 py-2 text-sm font-medium"
              href={`/api/import-jobs/${job.id}/error-report`}
            >
              下载错误报告
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[720px] text-left text-sm">
              <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
                <tr>
                  <th className="px-4 py-3">行号</th>
                  <th className="px-4 py-3">字段</th>
                  <th className="px-4 py-3">原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--fc-border)]">
                {job.errors.map((error) => (
                  <tr key={`${error.rowNumber}-${error.field}-${error.reason}`}>
                    <td className="px-4 py-3">{error.rowNumber}</td>
                    <td className="px-4 py-3">{error.field}</td>
                    <td className="px-4 py-3">{error.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <FeedbackPanel
          description="没有失败行，可以返回基础数据继续维护。"
          kind="success"
          title="全部导入成功"
        />
      )}
    </PageShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--fc-border)] bg-white p-4 shadow-[var(--fc-shadow-sm)]">
      <div className="text-sm text-[var(--fc-text-secondary)]">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
