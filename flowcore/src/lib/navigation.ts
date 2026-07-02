import { ClipboardList, Database, Gauge, Inbox } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import type { Route } from "next";

export type NavItem = {
  label: string;
  href: Route;
  icon: ComponentType<LucideProps>;
  description: string;
};

export const appNavItems: NavItem[] = [
  {
    label: "项目看板",
    href: "/dashboard",
    icon: Gauge,
    description: "扫视项目风险、节点和问题数"
  },
  {
    label: "问题/变更中心",
    href: "/issues",
    icon: ClipboardList,
    description: "统一查看、筛选和进入问题单"
  },
  {
    label: "我的待办",
    href: "/todos",
    icon: Inbox,
    description: "当前登录人的待办队列"
  },
  {
    label: "基础数据",
    href: "/base-data",
    icon: Database,
    description: "维护人员、部门、角色和项目"
  }
];
