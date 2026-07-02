"use client";

import { createRole, disableRole, updateRole } from "@/server/actions/master-data/roles";
import {
  actionButtonClass,
  dangerButtonClass,
  Field,
  confirmDangerAction,
  inputClass,
  secondaryButtonClass
} from "./form-fields";
import { toVoidAction } from "./server-action";

type Role = {
  id: string;
  name: string;
  permissions: string[];
  status: "active" | "disabled";
};

export function RoleTab({ roles }: { roles: Role[] }) {
  return (
    <div className="space-y-4">
      <form
        action={toVoidAction(createRole)}
        className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 md:grid-cols-[1fr_2fr_auto]"
      >
        <Field label="角色名称">
          <input className={inputClass} maxLength={50} name="name" required />
        </Field>
        <Field label="权限">
          <input
            className={inputClass}
            name="permissions"
            placeholder="dashboard:read, projects:manage"
          />
        </Field>
        <button className={actionButtonClass} type="submit">
          新建角色
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
        <table className="min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
            <tr>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">权限</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--fc-border)]">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    defaultValue={role.name}
                    form={`role-${role.id}`}
                    name="name"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    defaultValue={role.permissions.join(", ")}
                    form={`role-${role.id}`}
                    name="permissions"
                  />
                </td>
                <td className="px-4 py-3">{role.status === "active" ? "启用" : "停用"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={toVoidAction(updateRole)} id={`role-${role.id}`}>
                      <input name="id" type="hidden" value={role.id} />
                      <button className={secondaryButtonClass} type="submit">
                        保存
                      </button>
                    </form>
                    <form
                      action={toVoidAction(disableRole)}
                      onSubmit={confirmDangerAction("确认停用该角色？")}
                    >
                      <input name="id" type="hidden" value={role.id} />
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
