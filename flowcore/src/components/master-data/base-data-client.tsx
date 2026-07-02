"use client";

import { useState } from "react";
import { DepartmentTab } from "./department-tab";
import { ImportTab } from "./import-tab";
import { ProjectTab } from "./project-tab";
import { RoleTab } from "./role-tab";
import { UserTab } from "./user-tab";
import type { MasterDataSnapshot } from "@/lib/master-data/queries";

type BaseDataClientProps = {
  snapshot: MasterDataSnapshot;
  canManageMasterData: boolean;
  canManageProjects: boolean;
};

const tabs = [
  { id: "users", label: "人员", permission: "master" },
  { id: "departments", label: "部门", permission: "master" },
  { id: "roles", label: "角色", permission: "master" },
  { id: "projects", label: "项目", permission: "projects" },
  { id: "imports", label: "导入历史", permission: "any" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function BaseDataClient({
  snapshot,
  canManageMasterData,
  canManageProjects
}: BaseDataClientProps) {
  const visibleTabs = tabs.filter((tab) => {
    if (tab.permission === "master") {
      return canManageMasterData;
    }

    if (tab.permission === "projects") {
      return canManageProjects;
    }

    return canManageMasterData || canManageProjects;
  });
  const [activeTab, setActiveTab] = useState<TabId>(visibleTabs[0]?.id ?? "imports");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-[var(--fc-border)]">
        {visibleTabs.map((tab) => (
          <button
            className={[
              "border-b-2 px-3 py-2 text-sm font-medium",
              activeTab === tab.id
                ? "border-[var(--fc-primary)] text-[var(--fc-primary)]"
                : "border-transparent text-[var(--fc-text-secondary)]"
            ].join(" ")}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "users" && canManageMasterData ? <UserTab snapshot={snapshot} /> : null}
      {activeTab === "departments" && canManageMasterData ? (
        <DepartmentTab departments={snapshot.departments} />
      ) : null}
      {activeTab === "roles" && canManageMasterData ? <RoleTab roles={snapshot.roles} /> : null}
      {activeTab === "projects" && canManageProjects ? <ProjectTab snapshot={snapshot} /> : null}
      {activeTab === "imports" ? (
        <ImportTab
          canManageMasterData={canManageMasterData}
          canManageProjects={canManageProjects}
          importJobs={snapshot.importJobs}
        />
      ) : null}
    </div>
  );
}
