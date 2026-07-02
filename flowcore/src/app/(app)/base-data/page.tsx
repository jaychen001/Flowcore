import { BaseDataClient } from "@/components/master-data/base-data-client";
import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser } from "@/lib/current-user";
import { getMasterDataSnapshot } from "@/lib/master-data/queries";
import { hasPermission } from "@/lib/permissions";

export default async function BaseDataPage() {
  const user = await getCurrentUser();
  const permissions = user?.permissions ?? [];
  const canManageMasterData = hasPermission(permissions, "master-data:manage");
  const canManageProjects = hasPermission(permissions, "projects:manage");
  const snapshot = await getMasterDataSnapshot({
    userId: user?.id ?? "",
    canManageMasterData,
    canManageProjects
  });

  return (
    <PageShell
      description="维护人员、部门、角色、项目和导入入口。导入失败会展示行号、字段和原因。"
      eyebrow="SCREEN-008"
      title="基础数据管理"
    >
      <BaseDataClient
        canManageMasterData={canManageMasterData}
        canManageProjects={canManageProjects}
        snapshot={snapshot}
      />
    </PageShell>
  );
}
