"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  archiveProject,
  createProject,
  updateProject
} from "@/server/actions/master-data/projects";
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

export function ProjectTab({ snapshot }: { snapshot: MasterDataSnapshot }) {
  const activeUsers = snapshot.users.filter((user) => user.status === "active");

  return (
    <div className="space-y-4">
      <form
        action={toVoidAction(createProject)}
        className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <Field label="项目名称">
          <input className={inputClass} maxLength={100} name="name" required />
        </Field>
        <Field label="项目负责人">
          <OwnerSelect name="ownerId" users={activeUsers} />
        </Field>
        <Field label="计划交付日">
          <input className={inputClass} name="plannedDeliveryDate" required type="date" />
        </Field>
        <button className={actionButtonClass} type="submit">
          新建项目
        </button>
      </form>
      <div className="space-y-2">
        <div className="hidden grid-cols-[2fr_2fr_1.3fr_80px_150px] gap-3 px-4 text-xs font-semibold text-[var(--fc-text-secondary)] lg:grid">
          <div>项目</div>
          <div>负责人</div>
          <div>计划交付日</div>
          <div>状态</div>
          <div>操作</div>
        </div>
        {snapshot.projects.map((project) => (
          <div
            className="grid gap-3 rounded-md border border-[var(--fc-border)] bg-white p-4 shadow-[var(--fc-shadow-sm)] lg:grid-cols-[2fr_2fr_1.3fr_80px_150px] lg:items-center"
            data-record-row
            key={project.id}
          >
            <div className="grid gap-2">
              <span className="text-xs font-semibold text-[var(--fc-text-secondary)] lg:hidden">
                项目
              </span>
              <Link
                className={`${secondaryButtonClass} relative z-20 w-full self-start lg:w-fit`}
                href={`/projects/${project.id}` as Route}
              >
                节点
              </Link>
              <input
                className={inputClass}
                defaultValue={project.name}
                form={`project-${project.id}`}
                name="name"
              />
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-semibold text-[var(--fc-text-secondary)] lg:hidden">
                负责人
              </span>
              <OwnerSelect
                defaultValue={project.ownerId}
                form={`project-${project.id}`}
                name="ownerId"
                users={activeUsers}
              />
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-semibold text-[var(--fc-text-secondary)] lg:hidden">
                计划交付日
              </span>
              <input
                className={inputClass}
                defaultValue={project.plannedDeliveryDate ?? ""}
                form={`project-${project.id}`}
                name="plannedDeliveryDate"
                required
                type="date"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--fc-text-secondary)] lg:hidden">
                状态
              </span>
              <div className="mt-1 text-sm lg:mt-0">
                {project.status === "active" ? "启用" : "归档"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={toVoidAction(updateProject)} id={`project-${project.id}`}>
                <input name="id" type="hidden" value={project.id} />
                <button className={secondaryButtonClass} type="submit">
                  保存
                </button>
              </form>
              <form
                action={toVoidAction(archiveProject)}
                onSubmit={confirmDangerAction("确认归档该项目？")}
              >
                <input name="id" type="hidden" value={project.id} />
                <button className={dangerButtonClass} type="submit">
                  归档
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnerSelect({
  defaultValue,
  form,
  name,
  users
}: {
  defaultValue?: string;
  form?: string;
  name: string;
  users: Array<{ id: string; name: string; account: string }>;
}) {
  return (
    <select className={selectClass} defaultValue={defaultValue} form={form} name={name} required>
      <option value="">请选择</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}（{user.account}）
        </option>
      ))}
    </select>
  );
}
