import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const demoPassword = "FlowCore@123456";

const pageShells = [["/login", "欢迎登录"]] as const;

const protectedPaths = [
  "/dashboard",
  "/issues",
  "/issues/sample",
  "/todos",
  "/base-data",
  "/import-jobs/sample",
  "/ai",
  "/projects/sample",
  "/submit"
] as const;

for (const [path, heading] of pageShells) {
  test(`${path} renders its Phase 1 shell`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { exact: true, name: heading })).toBeVisible();
  });
}

test("external submit remains inside a 375px mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAsAfterSales(page);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});

test("external submit uses the sticky bottom action area from the prototype", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAsAfterSales(page);

  const footerPosition = await page
    .locator("footer")
    .evaluate((node) => window.getComputedStyle(node).position);

  expect(footerPosition).toBe("sticky");
});

for (const path of protectedPaths) {
  test(`${path} requires a valid session`, async ({ page }) => {
    await page.goto(path);

    const url = new URL(page.url());

    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("reason")).toBe("session_required");
    expect(url.searchParams.get("next")).toBe(path);
    await expect(page.getByRole("heading", { exact: true, name: "欢迎登录" })).toBeVisible();
    await expect(page.getByText("请先登录后再访问系统页面。")).toBeVisible();
  });
}

test("wecom callback degrades clearly when enterprise config is missing", async ({ request }) => {
  const response = await request.get("/api/wecom/callback");
  const body = (await response.json()) as { code: string; missing: string[] };

  expect(response.status()).toBe(503);
  expect(body.code).toBe("wecom_not_configured");
  expect(body.missing).toContain("WECOM_CORP_ID");
});

test("wecom start degrades clearly when enterprise config is missing", async ({ request }) => {
  const response = await request.get("/api/wecom/start");
  const body = (await response.json()) as { code: string; missing: string[] };

  expect(response.status()).toBe(503);
  expect(body.code).toBe("wecom_not_configured");
  expect(body.missing).toContain("WECOM_CORP_ID");
});

async function signInAsAfterSales(page: Page) {
  await page.goto("/login");
  await page.getByLabel("账号").fill("service001");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/submit$/);
}
