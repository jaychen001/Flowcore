import { describe, expect, it } from "vitest";
import {
  getDefaultRouteForRoles,
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
});
