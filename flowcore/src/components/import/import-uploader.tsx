"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useRef, useState, useTransition } from "react";
import { runImport } from "@/server/actions/import-jobs";
import { IMPORT_TYPE_LABELS, type ImportType } from "@/lib/imports/import-types";
import { actionButtonClass, selectClass } from "@/components/master-data/form-fields";

type ImportUploaderProps = {
  allowedTypes: ImportType[];
};

export function ImportUploader({ allowedTypes }: ImportUploaderProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await runImport(formData);

      setMessage(result.message);

      if (result.jobId) {
        formRef.current?.reset();
        router.push(`/import-jobs/${result.jobId}` as Route);
        router.refresh();
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 md:grid-cols-[180px_1fr_auto]"
      ref={formRef}
    >
      <select className={selectClass} name="importType" required>
        {allowedTypes.map((type) => (
          <option key={type} value={type}>
            {IMPORT_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <input
        accept=".xlsx"
        className="h-10 rounded-md border border-[var(--fc-border)] bg-white px-3 py-2 text-sm"
        name="file"
        required
        type="file"
      />
      <button className={actionButtonClass} disabled={isPending} type="submit">
        {isPending ? "导入中" : "导入 Excel"}
      </button>
      {message ? (
        <div className="text-sm text-[var(--fc-text-secondary)] md:col-span-3" role="status">
          {message}
        </div>
      ) : null}
    </form>
  );
}
