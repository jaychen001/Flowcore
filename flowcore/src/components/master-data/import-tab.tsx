"use client";

import Link from "next/link";
import type { Route } from "next";
import { ImportUploader } from "@/components/import/import-uploader";
import type { ImportType } from "@/lib/imports/import-types";
import { IMPORT_TYPE_LABELS } from "@/lib/imports/import-types";
import { secondaryButtonClass } from "./form-fields";

type ImportJob = {
  id: string;
  importType: ImportType;
  fileName: string;
  status: "success" | "failed" | "partial";
  successCount: number;
  failedCount: number;
};

type ImportTabProps = {
  canManageMasterData: boolean;
  canManageProjects: boolean;
  importJobs: ImportJob[];
};

export function ImportTab({ canManageMasterData, canManageProjects, importJobs }: ImportTabProps) {
  const allowedTypes: ImportType[] = [
    ...(canManageMasterData ? (["departments", "roles", "users"] as const) : []),
    ...(canManageProjects ? (["projects"] as const) : [])
  ];

  return (
    <div className="space-y-4">
      <ImportUploader allowedTypes={allowedTypes} />
      <div className="flex flex-wrap gap-2">
        {allowedTypes.map((type) => (
          <a className={secondaryButtonClass} href={`/api/import-jobs/template/${type}`} key={type}>
            下载{IMPORT_TYPE_LABELS[type]}模板
          </a>
        ))}
      </div>
      <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
        <table className="min-w-[820px] text-left text-sm">
          <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
            <tr>
              <th className="px-4 py-3">文件</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">成功</th>
              <th className="px-4 py-3">失败</th>
              <th className="px-4 py-3">详情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--fc-border)]">
            {importJobs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-[var(--fc-text-secondary)]" colSpan={6}>
                  暂无导入历史。
                </td>
              </tr>
            ) : (
              importJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3">{job.fileName}</td>
                  <td className="px-4 py-3">{IMPORT_TYPE_LABELS[job.importType]}</td>
                  <td className="px-4 py-3">{getStatusText(job.status)}</td>
                  <td className="px-4 py-3">{job.successCount}</td>
                  <td className="px-4 py-3">{job.failedCount}</td>
                  <td className="px-4 py-3">
                    <Link className={secondaryButtonClass} href={`/import-jobs/${job.id}` as Route}>
                      查看
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusText(status: ImportJob["status"]): string {
  if (status === "success") {
    return "成功";
  }

  if (status === "partial") {
    return "部分成功";
  }

  return "失败";
}
