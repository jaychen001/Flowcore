import { describe, expect, it } from "vitest";
import { validateImportRows } from "./import-validator";

const context = {
  departments: [{ id: "dept-1", name: "研发部" }],
  roles: [{ id: "role-1", name: "project_manager" }],
  users: [{ id: "user-1", name: "项目负责人", account: "pm001" }],
  projectNames: ["既有项目"]
};

describe("validateImportRows", () => {
  it("reports row number and field when a required field is missing", () => {
    const result = validateImportRows(
      "users",
      [
        {
          rowNumber: 2,
          values: {
            人员姓名: "",
            账号: "new-user",
            初始密码: "FlowCore@123456",
            部门: "研发部",
            角色: "project_manager"
          }
        }
      ],
      context
    );

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toContainEqual({
      rowNumber: 2,
      field: "人员姓名",
      reason: "缺少必填字段。"
    });
  });

  it("accepts valid project rows that reference an active owner account", () => {
    const result = validateImportRows(
      "projects",
      [
        {
          rowNumber: 2,
          values: {
            项目名称: "新项目",
            项目负责人账号: "pm001",
            计划交付日: "2026-09-01"
          }
        }
      ],
      context
    );

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(1);
  });

  it("rejects project rows without a planned delivery date", () => {
    const result = validateImportRows(
      "projects",
      [
        {
          rowNumber: 2,
          values: {
            项目名称: "缺日期项目",
            项目负责人账号: "pm001",
            计划交付日: ""
          }
        }
      ],
      context
    );

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toContainEqual({
      rowNumber: 2,
      field: "计划交付日",
      reason: "缺少必填字段。"
    });
  });

  it("rejects project rows with an invalid planned delivery date", () => {
    const result = validateImportRows(
      "projects",
      [
        {
          rowNumber: 2,
          values: {
            项目名称: "非法日期项目",
            项目负责人账号: "pm001",
            计划交付日: "2026-02-31"
          }
        }
      ],
      context
    );

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toContainEqual({
      rowNumber: 2,
      field: "计划交付日",
      reason: "日期格式不合法，请使用 YYYY-MM-DD。"
    });
  });
});
