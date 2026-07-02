import { NextResponse } from "next/server";
import { requireAnyPermission } from "@/lib/current-user";
import { buildImportTemplateBuffer } from "@/lib/imports/error-report";
import { IMPORT_TYPE_LABELS, isImportType } from "@/lib/imports/import-types";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { type } = await context.params;

  if (!isImportType(type)) {
    return NextResponse.json({ message: "未知导入类型。" }, { status: 404 });
  }

  await requireAnyPermission(type === "projects" ? ["projects:manage"] : ["master-data:manage"]);

  const buffer = await buildImportTemplateBuffer(type);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        IMPORT_TYPE_LABELS[type]
      )}-import-template.xlsx"`
    }
  });
}
