"use client";

import { createUser, disableUser, updateUser } from "@/server/actions/master-data/users";
import type { MasterDataSnapshot } from "@/lib/master-data/queries";
import {
  actionButtonClass,
  dangerButtonClass,
  Field,
  confirmDangerAction,
  inputClass,
  secondaryButtonClass,
  selectClass
} from "./form-fields";
import { toVoidAction } from "./server-action";

export function UserTab({ snapshot }: { snapshot: MasterDataSnapshot }) {
  const activeDepartments = snapshot.departments.filter(
    (department) => department.status === "active"
  );
  const activeRoles = snapshot.roles.filter((role) => role.status === "active");

  return (
    <div className="space-y-4">
      <form
        action={toVoidAction(createUser)}
        className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 lg:grid-cols-3"
      >
        <Field label="人员姓名">
          <input className={inputClass} maxLength={50} name="name" required />
        </Field>
        <Field label="账号">
          <input className={inputClass} maxLength={64} name="account" required />
        </Field>
        <Field label="初始密码">
          <input className={inputClass} minLength={8} name="password" required type="password" />
        </Field>
        <Field label="部门">
          <SelectOptions name="departmentId" options={activeDepartments} />
        </Field>
        <Field label="角色">
          <SelectOptions name="roleId" options={activeRoles} />
        </Field>
        <Field label="企业微信 UserID">
          <input className={inputClass} maxLength={100} name="wecomUserid" />
        </Field>
        <button className={actionButtonClass} type="submit">
          新建人员
        </button>
      </form>
      <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
            <tr>
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">账号</th>
              <th className="px-4 py-3">部门</th>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--fc-border)]">
            {snapshot.users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    defaultValue={user.name}
                    form={`user-${user.id}`}
                    name="name"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className={inputClass}
                    defaultValue={user.account}
                    form={`user-${user.id}`}
                    name="account"
                  />
                </td>
                <td className="px-4 py-3">
                  <SelectOptions
                    defaultValue={user.departmentId ?? ""}
                    form={`user-${user.id}`}
                    name="departmentId"
                    options={activeDepartments}
                  />
                </td>
                <td className="px-4 py-3">
                  <SelectOptions
                    defaultValue={user.roleIds[0] ?? ""}
                    form={`user-${user.id}`}
                    name="roleId"
                    options={activeRoles}
                  />
                </td>
                <td className="px-4 py-3">{user.status === "active" ? "启用" : "停用"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={toVoidAction(updateUser)} id={`user-${user.id}`}>
                      <input name="id" type="hidden" value={user.id} />
                      <input name="password" type="hidden" value="" />
                      <input name="wecomUserid" type="hidden" value={user.wecomUserid ?? ""} />
                      <button className={secondaryButtonClass} type="submit">
                        保存
                      </button>
                    </form>
                    <form
                      action={toVoidAction(disableUser)}
                      onSubmit={confirmDangerAction("确认停用该人员？")}
                    >
                      <input name="id" type="hidden" value={user.id} />
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

function SelectOptions({
  defaultValue,
  form,
  name,
  options
}: {
  defaultValue?: string;
  form?: string;
  name: string;
  options: Array<{ id: string; name: string }>;
}) {
  return (
    <select className={selectClass} defaultValue={defaultValue} form={form} name={name} required>
      <option value="">请选择</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
