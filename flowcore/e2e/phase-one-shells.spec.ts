import { expect, test } from "@playwright/test";

const pageShells = [
  ["/login", "欢迎登录"],
  ["/dashboard", "项目看板"],
  ["/issues", "问题 / 变更中心"],
  ["/issues/sample", "问题 / 变更详情"],
  ["/todos", "我的待办"],
  ["/base-data", "基础数据管理"],
  ["/import-jobs/sample", "导入结果"],
  ["/submit", "现场问题提交系统"],
  ["/ai", "AI 建议面板"],
  ["/projects/sample", "项目详情"]
] as const;

for (const [path, heading] of pageShells) {
  test(`${path} renders its Phase 1 shell`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { exact: true, name: heading })).toBeVisible();
  });
}

test("external submit remains inside a 375px mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/submit");

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test("external submit uses the sticky bottom action area from the prototype", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/submit");

  const footerPosition = await page
    .locator("footer")
    .evaluate((node) => window.getComputedStyle(node).position);

  expect(footerPosition).toBe("sticky");
});
