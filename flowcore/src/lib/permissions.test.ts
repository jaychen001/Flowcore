import { describe, expect, it } from "vitest";
import {
  getDefaultRouteForRoles,
  getPermissionsForRoleRecords,
  getPermissionsForRoles,
  hasAnyPermission,
  hasPermission
} from "./permissions";

describe("permissions", () => {
  it("maps project manager roles to dashboard permissions", () => {
    const permissions = getPermissionsForRoles(["project_manager"]);

    expect(hasPermission(permissions, "dashboard:read")).toBe(true);
    expect(hasPermission(permissions, "projects:manage")).toBe(true);
    expect(hasAnyPermission(permissions, ["master-data:manage", "projects:manage"])).toBe(true);
    expect(getDefaultRouteForRoles(["project_manager"])).toBe("/dashboard");
  });

  it("sends pure after-sales users to the external submit entry", () => {
    expect(getPermissionsForRoles(["after_sales"])).toContain("external-submit:use");
    expect(getDefaultRouteForRoles(["after_sales"])).toBe("/submit");
  });

  it("prefers database role permissions and falls back for seeded roles with empty permissions", () => {
    const permissions = getPermissionsForRoleRecords([
      { name: "custom_project_role", permissions: ["projects:manage"] },
      { name: "viewer", permissions: [] }
    ]);

    expect(permissions).toContain("projects:manage");
    expect(permissions).toContain("dashboard:read");
    expect(permissions).toContain("issues:read");
  });
});
