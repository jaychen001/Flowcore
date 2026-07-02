import ExcelJS from "exceljs";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const demoPassword = "FlowCore@123456";

test("admin can maintain departments and users with disable confirmation", async ({
  page
}, testInfo) => {
  const suffix = uniqueSuffix(testInfo);
  const departmentName = `测试部门-${suffix}`;
  const userName = `测试人员-${suffix}`;
  const account = `u-${suffix}`;

  await signIn(page, "admin");
  await page.goto("/base-data");
  await expect(page.getByRole("heading", { name: "基础数据管理" })).toBeVisible();
  expect(await page.content()).not.toContain("passwordHash");
  expect(await page.content()).not.toContain("password_hash");

  await page.getByRole("button", { exact: true, name: "部门" }).click();
  await page.getByLabel("部门名称").fill(departmentName);
  await page.getByLabel("部门类型").fill("qa");
  await page.getByRole("button", { name: "新建部门" }).click();
  await expect(rowWithInputValue(page, departmentName)).toBeVisible();

  await page.getByRole("button", { exact: true, name: "人员" }).click();
  await page.getByLabel("人员姓名").fill(userName);
  await page.getByLabel("账号").fill(account);
  await page.getByLabel("初始密码").fill("TempPass123");
  await page.getByLabel("部门").selectOption({ label: departmentName });
  await page.getByLabel("角色").selectOption({ label: "viewer" });
  await page.getByRole("button", { name: "新建人员" }).click();

  const userRow = rowWithInputValue(page, account);
  await expect(userRow).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await userRow.getByRole("button", { name: "停用" }).click();
  await expect(userRow.getByText("停用")).toBeVisible();
});

test("project manager can create a project and edit its generated nodes", async ({
  page
}, testInfo) => {
  const suffix = uniqueSuffix(testInfo);
  const projectName = `节点项目-${suffix}`;
  const adjustedNodeName = `项目立项-${suffix}`;

  await signIn(page, "pm001");
  await page.goto("/base-data");

  await expect(page.getByRole("button", { exact: true, name: "项目" })).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "人员" })).toHaveCount(0);
  await expect(page.getByRole("button", { exact: true, name: "部门" })).toHaveCount(0);
  await expect(page.getByRole("button", { exact: true, name: "角色" })).toHaveCount(0);
  await page.getByLabel("项目名称").fill(projectName);
  await page.getByLabel("项目负责人").selectOption({ label: "项目负责人（pm001）" });
  await page.getByLabel("计划交付日").fill("2026-12-31");
  await page.getByRole("button", { name: "新建项目" }).click();

  const projectRow = rowWithInputValue(page, projectName);
  await expect(projectRow).toBeVisible();
  await projectRow.getByRole("link", { name: "节点" }).scrollIntoViewIfNeeded();
  await projectRow.getByRole("link", { name: "节点" }).click();

  await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
  expect(await page.content()).not.toContain("passwordHash");
  expect(await page.content()).not.toContain("password_hash");
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(inputWithValue(page, "机械 / 电气设计完成")).toBeVisible();
  await expect(inputWithValue(page, "客户验收")).toBeVisible();

  const firstNodeRow = page.locator("tbody tr").first();
  await firstNodeRow.locator('input[name="name"]').fill(adjustedNodeName);
  await firstNodeRow.locator('select[name="status"]').selectOption("in_progress");
  await Promise.all([
    page.waitForResponse(
      (response) => response.request().method() === "POST" && response.url().includes("/projects/")
    ),
    firstNodeRow.getByRole("button", { name: "保存节点" }).click()
  ]);

  await expect(firstNodeRow.locator('input[name="name"]')).toHaveValue(adjustedNodeName);
  await page.reload();
  await expect(inputWithValue(page, adjustedNodeName)).toBeVisible();
});

test("user Excel import reports row field and reason for failed data", async ({
  page
}, testInfo) => {
  const workbookPath = testInfo.outputPath(`users-invalid-${uniqueSuffix(testInfo)}.xlsx`);

  await writeWorkbook(
    workbookPath,
    ["人员姓名", "账号", "初始密码", "部门", "角色"],
    [["", `import-user-${uniqueSuffix(testInfo)}`, "TempPass123", "项目管理部", "viewer"]]
  );
  await signIn(page, "admin");
  await page.goto("/base-data");
  await page.getByRole("button", { exact: true, name: "导入历史" }).click();
  await page.locator('select[name="importType"]').selectOption("users");
  await page.locator('input[type="file"]').setInputFiles(workbookPath);
  await page.getByRole("button", { name: "导入 Excel" }).click();

  await expect(page).toHaveURL(/\/import-jobs\/.+/);
  await expect(page.getByRole("heading", { name: "导入结果" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "2" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "人员姓名" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "缺少必填字段。" })).toBeVisible();

  const adminImportJobPath = new URL(page.url()).pathname;

  await page.context().clearCookies();
  await signIn(page, "pm001");
  await page.goto(adminImportJobPath);
  await expect(page.getByRole("heading", { name: "页面不存在" })).toBeVisible();
});

test("project Excel import creates the default ten project nodes", async ({ page }, testInfo) => {
  const suffix = uniqueSuffix(testInfo);
  const projectName = `导入项目-${suffix}`;
  const workbookPath = testInfo.outputPath(`projects-valid-${suffix}.xlsx`);

  await writeWorkbook(
    workbookPath,
    ["项目名称", "项目负责人账号", "计划交付日"],
    [[projectName, "pm001", "2026-12-31"]]
  );
  await signIn(page, "pm001");
  await page.goto("/base-data");
  await page.getByRole("button", { exact: true, name: "导入历史" }).click();
  await page.locator('select[name="importType"]').selectOption("projects");
  await page.locator('input[type="file"]').setInputFiles(workbookPath);
  await page.getByRole("button", { name: "导入 Excel" }).click();

  await expect(page).toHaveURL(/\/import-jobs\/.+/);
  await expect(page.getByRole("heading", { name: "导入结果" })).toBeVisible();
  await expect(page.getByText("全部导入成功")).toBeVisible();

  await page.getByRole("link", { name: "返回基础数据" }).click();
  const projectRow = rowWithInputValue(page, projectName);
  await expect(projectRow).toBeVisible();
  await projectRow.getByRole("link", { name: "节点" }).scrollIntoViewIfNeeded();
  await projectRow.getByRole("link", { name: "节点" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(10);
});

async function signIn(page: Page, account: string) {
  await page.goto("/login");
  await page.getByLabel("账号").fill(account);
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(account === "service001" ? /\/submit$/ : /\/dashboard$/);
}

async function writeWorkbook(path: string, headers: string[], rows: string[][]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("导入数据");

  worksheet.addRow(headers);
  for (const row of rows) {
    worksheet.addRow(row);
  }

  await workbook.xlsx.writeFile(path);
}

function rowWithInputValue(page: Page, value: string) {
  return page.locator("tbody tr, [data-record-row]").filter({ has: inputWithValue(page, value) });
}

function inputWithValue(page: Page, value: string) {
  return page.locator(`input[value="${escapeAttributeValue(value)}"]`);
}

function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function uniqueSuffix(testInfo: TestInfo): string {
  const projectName = testInfo.project.name.replace(/[^a-z0-9]/gi, "").slice(0, 10);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);

  return `${projectName}-${timestamp}-${random}`;
}
