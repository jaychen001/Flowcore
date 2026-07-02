"use client";

import { updateProjectNode } from "@/server/actions/master-data/projects";
import {
  inputClass,
  secondaryButtonClass,
  selectClass
} from "@/components/master-data/form-fields";
import { toVoidAction } from "@/components/master-data/server-action";

type ProjectNode = {
  id: string;
  name: string;
  sequence: number;
  plannedDate: string | null;
  ownerId: string | null;
  status: "not_started" | "in_progress" | "completed" | "disabled";
};

type UserOption = {
  id: string;
  name: string;
  account: string;
};

export function ProjectNodeTable({ nodes, users }: { nodes: ProjectNode[]; users: UserOption[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--fc-border)] bg-white shadow-[var(--fc-shadow-sm)]">
      <table className="min-w-[980px] text-left text-sm">
        <thead className="bg-[var(--fc-surface-muted)] text-xs font-semibold text-[var(--fc-text-secondary)]">
          <tr>
            <th className="px-4 py-3">序号</th>
            <th className="px-4 py-3">节点名称</th>
            <th className="px-4 py-3">计划日期</th>
            <th className="px-4 py-3">负责人</th>
            <th className="px-4 py-3">状态</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--fc-border)]">
          {nodes.map((node) => (
            <tr key={node.id}>
              <td className="px-4 py-3">{node.sequence}</td>
              <td className="px-4 py-3">
                <input
                  className={inputClass}
                  defaultValue={node.name}
                  form={`node-${node.id}`}
                  name="name"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  className={inputClass}
                  defaultValue={node.plannedDate ?? ""}
                  form={`node-${node.id}`}
                  name="plannedDate"
                  required
                  type="date"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  className={selectClass}
                  defaultValue={node.ownerId ?? ""}
                  form={`node-${node.id}`}
                  name="ownerId"
                >
                  <option value="">未分配</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}（{user.account}）
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <select
                  className={selectClass}
                  defaultValue={node.status}
                  form={`node-${node.id}`}
                  name="status"
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="disabled">停用</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <form action={toVoidAction(updateProjectNode)} id={`node-${node.id}`}>
                  <input name="id" type="hidden" value={node.id} />
                  <button className={secondaryButtonClass} type="submit">
                    保存节点
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
