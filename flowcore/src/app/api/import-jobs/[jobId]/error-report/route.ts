import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/current-user";
import { buildErrorReportBuffer } from "@/lib/imports/error-report";
import { getImportJobDetail } from "@/lib/master-data/queries";
import { hasPermission } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const user = await requireCurrentUser();
  const job = await getImportJobDetail(jobId, {
    userId: user.id,
    canManageMasterData: hasPermission(user.permissions, "master-data:manage"),
    canManageProjects: hasPermission(user.permissions, "projects:manage")
  });

  if (!job) {
    return NextResponse.json({ message: "导入任务不存在。" }, { status: 404 });
  }

  const buffer = await buildErrorReportBuffer(job.errors);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="import-errors-${job.id}.xlsx"`
    }
  });
}
