import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ProjectNodeTable } from "@/components/projects/project-node-table";
import { getProjectDetail } from "@/lib/master-data/queries";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const detail = await getProjectDetail(projectId);

  if (!detail) {
    notFound();
  }

  return (
    <PageShell
      description={`负责人：${detail.project.ownerName}。项目负责人可调整节点名称、计划日期、负责人和状态。`}
      eyebrow="SCREEN-003"
      title={detail.project.name}
      actions={
        <Link
          className="rounded-md border border-[var(--fc-border)] px-3 py-2 text-sm font-medium"
          href="/base-data"
        >
          返回基础数据
        </Link>
      }
    >
      <ProjectNodeTable nodes={detail.nodes} users={detail.users} />
    </PageShell>
  );
}
