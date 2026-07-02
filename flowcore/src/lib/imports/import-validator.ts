import type { ParsedExcelRow } from "./excel-parser";
import type { ImportError, ImportType } from "./import-types";
import { isDateInputValue } from "../projects/project-dates";

type Lookup = {
  id: string;
  name: string;
  account?: string;
  status?: "active" | "disabled";
};

export type ImportContext = {
  departments: Lookup[];
  roles: Lookup[];
  users: Lookup[];
  projectNames: string[];
};

export type ValidDepartmentRow = {
  rowNumber: number;
  name: string;
  type: string;
};

export type ValidRoleRow = {
  rowNumber: number;
  name: string;
  permissions: string[];
};

export type ValidUserRow = {
  rowNumber: number;
  name: string;
  account: string;
  password: string;
  departmentId: string;
  roleId: string;
  wecomUserid: string | null;
};

export type ValidProjectRow = {
  rowNumber: number;
  name: string;
  ownerId: string;
  plannedDeliveryDate: string;
};

export type ValidImportRow = ValidDepartmentRow | ValidRoleRow | ValidUserRow | ValidProjectRow;

export type ImportValidationResult = {
  validRows: ValidImportRow[];
  errors: ImportError[];
};

export function validateImportRows(
  importType: ImportType,
  rows: ParsedExcelRow[],
  context: ImportContext
): ImportValidationResult {
  const errors: ImportError[] = [];
  const validRows: ValidImportRow[] = [];
  const seenUniqueValues = new Set<string>();

  for (const row of rows) {
    const rowErrors: ImportError[] = [];
    const validRow = validateRow(importType, row, context, seenUniqueValues, rowErrors);

    if (rowErrors.length > 0 || !validRow) {
      errors.push(...rowErrors);
    } else {
      validRows.push(validRow);
    }
  }

  return { validRows, errors };
}

function validateRow(
  importType: ImportType,
  row: ParsedExcelRow,
  context: ImportContext,
  seenUniqueValues: Set<string>,
  errors: ImportError[]
): ValidImportRow | null {
  if (importType === "departments") {
    const name = required(row, "部门名称", errors);
    const type = required(row, "部门类型", errors);

    if (name) {
      rejectDuplicate(
        row.rowNumber,
        "部门名称",
        name,
        context.departments,
        seenUniqueValues,
        errors
      );
    }

    return name && type ? { rowNumber: row.rowNumber, name, type } : null;
  }

  if (importType === "roles") {
    const name = required(row, "角色名称", errors);

    if (name) {
      rejectDuplicate(row.rowNumber, "角色名称", name, context.roles, seenUniqueValues, errors);
    }

    return name
      ? {
          rowNumber: row.rowNumber,
          name,
          permissions: splitList(row.values["权限"])
        }
      : null;
  }

  if (importType === "users") {
    const name = required(row, "人员姓名", errors);
    const account = required(row, "账号", errors);
    const password = required(row, "初始密码", errors);
    const departmentName = required(row, "部门", errors);
    const roleName = required(row, "角色", errors);
    const department = findActiveByName(context.departments, departmentName);
    const role = findActiveByName(context.roles, roleName);

    if (account) {
      rejectDuplicate(
        row.rowNumber,
        "账号",
        account,
        context.users,
        seenUniqueValues,
        errors,
        "account"
      );
    }

    if (departmentName && !department) {
      errors.push({ rowNumber: row.rowNumber, field: "部门", reason: "部门不存在。" });
    }

    if (roleName && !role) {
      errors.push({ rowNumber: row.rowNumber, field: "角色", reason: "角色不存在。" });
    }

    return name && account && password && department && role
      ? {
          rowNumber: row.rowNumber,
          name,
          account,
          password,
          departmentId: department.id,
          roleId: role.id,
          wecomUserid: row.values["企业微信UserID"] || null
        }
      : null;
  }

  const name = required(row, "项目名称", errors);
  const ownerAccount = required(row, "项目负责人账号", errors);
  const plannedDeliveryDateValue = required(row, "计划交付日", errors);
  const owner = findActiveByAccount(context.users, ownerAccount);

  if (name) {
    const duplicateProjects = context.projectNames.map((projectName) => ({
      id: projectName,
      name: projectName
    }));
    rejectDuplicate(row.rowNumber, "项目名称", name, duplicateProjects, seenUniqueValues, errors);
  }

  if (ownerAccount && !owner) {
    errors.push({
      rowNumber: row.rowNumber,
      field: "项目负责人账号",
      reason: "项目负责人不存在或账号不可用。"
    });
  }

  const plannedDeliveryDate = normalizeRequiredDate(
    row.rowNumber,
    "计划交付日",
    plannedDeliveryDateValue,
    errors
  );

  return name && owner && plannedDeliveryDate
    ? {
        rowNumber: row.rowNumber,
        name,
        ownerId: owner.id,
        plannedDeliveryDate
      }
    : null;
}

function required(row: ParsedExcelRow, field: string, errors: ImportError[]): string {
  const value = row.values[field]?.trim() ?? "";

  if (!value) {
    errors.push({ rowNumber: row.rowNumber, field, reason: "缺少必填字段。" });
  }

  return value;
}

function rejectDuplicate(
  rowNumber: number,
  field: string,
  value: string,
  existing: Lookup[],
  seenUniqueValues: Set<string>,
  errors: ImportError[],
  existingKey: "name" | "account" = "name"
) {
  const normalized = value.toLowerCase();
  const seenKey = `${field}:${normalized}`;

  if (seenUniqueValues.has(seenKey)) {
    errors.push({ rowNumber, field, reason: "同一 Excel 中存在重复值。" });
  }

  if (existing.some((item) => item[existingKey]?.toLowerCase() === normalized)) {
    errors.push({ rowNumber, field, reason: "系统中已存在相同记录。" });
  }

  seenUniqueValues.add(seenKey);
}

function splitList(value?: string): string[] {
  return (value ?? "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function findActiveByName(items: Lookup[], name: string): Lookup | undefined {
  return items.find((item) => item.name === name && item.status !== "disabled");
}

function findActiveByAccount(items: Lookup[], account: string): Lookup | undefined {
  return items.find((item) => item.account === account && item.status !== "disabled");
}

function normalizeRequiredDate(
  rowNumber: number,
  field: string,
  value: string,
  errors: ImportError[]
): string | null {
  if (!value) {
    return null;
  }

  if (isDateInputValue(value)) {
    return value;
  }

  errors.push({ rowNumber, field, reason: "日期格式不合法，请使用 YYYY-MM-DD。" });
  return null;
}
