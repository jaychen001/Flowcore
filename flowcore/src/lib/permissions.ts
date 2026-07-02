import type { Route } from "next";

export const ROLE_PERMISSIONS = {
  admin: [
    "dashboard:read",
    "master-data:manage",
    "projects:manage",
    "issues:read",
    "issues:manage",
    "todos:read"
  ],
  project_manager: ["dashboard:read", "projects:manage", "issues:read", "todos:read"],
  rd_owner: ["issues:manage", "todos:read", "dashboard:read"],
  after_sales: ["external-submit:use"],
  viewer: ["dashboard:read", "issues:read"]
} as const;

export type RoleName = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[RoleName][number];

export function getPermissionsForRoles(roleNames: string[]): Permission[] {
  const permissions = new Set<Permission>();

  for (const roleName of roleNames) {
    if (isRoleName(roleName)) {
      for (const permission of ROLE_PERMISSIONS[roleName]) {
        permissions.add(permission);
      }
    }
  }

  return [...permissions];
}

export function hasPermission(permissions: string[], permission: Permission): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: string[],
  candidates: readonly Permission[]
): boolean {
  return candidates.some((permission) => hasPermission(permissions, permission));
}

export function getDefaultRouteForRoles(roleNames: string[]): Route {
  if (roleNames.includes("after_sales") && roleNames.length === 1) {
    return "/submit";
  }

  return "/dashboard";
}

function isRoleName(roleName: string): roleName is RoleName {
  return roleName in ROLE_PERMISSIONS;
}
