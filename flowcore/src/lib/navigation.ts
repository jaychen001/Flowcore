import { ClipboardList, Database, Gauge, Inbox } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import type { Route } from "next";
import type { Permission } from "./permissions";
import { hasAnyPermission } from "./permissions";

export type NavItem = {
  label: string;
  href: Route;
  icon: ComponentType<LucideProps>;
  description: string;
  requiredPermissions: readonly Permission[];
};

export const appNavItems: NavItem[] = [
  {
    label: "项目看板",
    href: "/dashboard",
    icon: Gauge,
    description: "扫视项目风险、节点和问题数",
    requiredPermissions: ["dashboard:read"]
  },
  {
    label: "问题/变更中心",
    href: "/issues",
    icon: ClipboardList,
    description: "统一查看、筛选和进入问题单",
    requiredPermissions: ["issues:read", "issues:manage"]
  },
  {
    label: "我的待办",
    href: "/todos",
    icon: Inbox,
    description: "当前登录人的待办队列",
    requiredPermissions: ["todos:read"]
  },
  {
    label: "基础数据",
    href: "/base-data",
    icon: Database,
    description: "维护人员、部门、角色和项目",
    requiredPermissions: ["master-data:manage", "projects:manage"]
  }
];

const routeAccessRules: Array<{
  prefix: string;
  requiredPermissions: readonly Permission[];
}> = [
  { prefix: "/base-data", requiredPermissions: ["master-data:manage", "projects:manage"] },
  { prefix: "/import-jobs", requiredPermissions: ["master-data:manage", "projects:manage"] },
  { prefix: "/issues", requiredPermissions: ["issues:read", "issues:manage"] },
  { prefix: "/projects", requiredPermissions: ["projects:manage"] },
  { prefix: "/todos", requiredPermissions: ["todos:read"] },
  { prefix: "/dashboard", requiredPermissions: ["dashboard:read"] },
  { prefix: "/ai", requiredPermissions: ["dashboard:read"] }
];

export function getVisibleNavItems(permissions: string[]): NavItem[] {
  return appNavItems.filter((item) => hasAnyPermission(permissions, item.requiredPermissions));
}

export function canAccessAppPath(pathname: string, permissions: string[]): boolean {
  const rule = routeAccessRules.find((candidate) => pathname.startsWith(candidate.prefix));

  if (!rule) {
    return true;
  }

  return hasAnyPermission(permissions, rule.requiredPermissions);
}
