"use client";

import {
  createDepartment,
  disableDepartment,
  updateDepartment
} from "@/server/actions/master-data/departments";
import {
  actionButtonClass,
  dangerButtonClass,
  Field,
  confirmDangerAction,
  inputClass,
  secondaryButtonClass
} from "./form-fields";
import { toVoidAction } from "./server-action";

type Department = {
  id: string;
  name: string;
  type: string;
  status: "active" | "disabled";
};

export function DepartmentTab({ departments }: { departments: Department[] }) {
  return (
    <div className="space-y-4">
      <form
        action={toVoidAction(createDepartment)}
        className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <Field label="部门名称">
          <input className={inputClass} maxLength={50} name="name" required />
        </Field>
        <Field label="部门类型">
          <input
            className={inputClass}
            maxLength={50}
            name="type"
            placeholder="project / rd / production"
            required
          />
        </Field>
        <button className={actionButtonClass} type="submit">
          新建部门
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
        <table className="min-w-[680px] text-left text-sm">
          <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
            <tr>
              <th className="px-4 py-3">部门</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--fc-border)]">
            {departments.map((department) => (
              <tr key={department.id}>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    form={`department-${department.id}`}
                    name="name"
                    defaultValue={department.name}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    form={`department-${department.id}`}
                    name="type"
                    defaultValue={department.type}
                  />
                </td>
                <td className="px-4 py-3">{department.status === "active" ? "启用" : "停用"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={toVoidAction(updateDepartment)}
                      id={`department-${department.id}`}
                    >
                      <input name="id" type="hidden" value={department.id} />
                      <button className={secondaryButtonClass} type="submit">
                        保存
                      </button>
                    </form>
                    <form
                      action={toVoidAction(disableDepartment)}
                      onSubmit={confirmDangerAction("确认停用该部门？")}
                    >
                      <input name="id" type="hidden" value={department.id} />
                      <button className={dangerButtonClass} type="submit">
                        停用
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
