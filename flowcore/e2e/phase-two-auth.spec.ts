import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const demoPassword = "FlowCore@123456";
const authSecret = "phase2-test-secret-minimum-32-characters";

test("valid local account signs in and reaches the role default page", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("admin");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { exact: true, name: "项目看板" })).toBeVisible();

  const meResponse = await page.request.get("/api/me");
  const meBody = (await meResponse.json()) as { user: { name: string } };

  expect(meResponse.status()).toBe(200);
  expect(meBody.user.name).toBe("系统管理员");
});

test("after-sales-only account signs in to the external submit entry", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("service001");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page).toHaveURL(/\/submit$/);
  await expect(page.getByRole("heading", { exact: true, name: "现场问题提交系统" })).toBeVisible();
});

test("disabled local account is blocked with a clear reason", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: {
      account: "disabled001",
      password: demoPassword
    }
  });
  const body = (await response.json()) as { code: string; message: string };

  expect(response.status()).toBe(403);
  expect(body.code).toBe("account_disabled");
  expect(body.message).toContain("账号已停用");
});

test("invalid password is rejected with a clear reason", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: {
      account: "admin",
      password: "WrongPassword123"
    }
  });
  const body = (await response.json()) as { code: string; message: string };

  expect(response.status()).toBe(401);
  expect(body.code).toBe("invalid_credentials");
  expect(body.message).toContain("账号或密码错误");
});

test("logged-in account without module permission sees a no-access state", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("service001");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/submit$/);

  await page.goto("/base-data");

  await expect(page.getByRole("heading", { exact: true, name: "没有访问权限" })).toBeVisible();
  await expect(page.getByText("当前账号角色没有访问此模块的权限")).toBeVisible();
});

test("non-after-sales account cannot access the external submit entry", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("admin");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/submit");

  await expect(page.getByRole("heading", { exact: true, name: "没有访问权限" })).toBeVisible();
  await expect(page.getByText("当前账号不是售后提交角色")).toBeVisible();
});

test("logout clears the active local session", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("账号").fill("admin");
  await page.getByLabel("密码").fill(demoPassword);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const logoutResponse = await page.request.post("/api/logout");
  expect(logoutResponse.status()).toBe(200);

  await page.goto("/dashboard");
  const url = new URL(page.url());

  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("reason")).toBe("session_required");
  expect(url.searchParams.get("next")).toBe("/dashboard");
});

test("expired wecom pending identity cannot bind a system user", async ({ request }) => {
  const response = await request.post("/api/wecom/bind", {
    data: {
      account: "pm001",
      password: demoPassword
    }
  });
  const body = (await response.json()) as { code: string; message: string };

  expect(response.status()).toBe(401);
  expect(body.code).toBe("wecom_binding_expired");
  expect(body.message).toContain("绑定状态已过期");
});

test("wecom pending identity binds to an existing active user and signs in", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "flowcore_wecom_pending",
      value: createPendingWecomCookie("corp-test", "wecom-pm-001"),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/wecom/bind");
  await page.getByLabel("已有系统账号").fill("pm001");
  await page.getByLabel("账号密码").fill(demoPassword);
  await page.getByRole("button", { name: "绑定并登录" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { exact: true, name: "项目看板" })).toBeVisible();

  const meResponse = await page.request.get("/api/me");
  const meBody = (await meResponse.json()) as { user: { account: string } };

  expect(meResponse.status()).toBe(200);
  expect(meBody.user.account).toBe("pm001");
});

test("wecom binding blocks disabled existing users", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "flowcore_wecom_pending",
      value: createPendingWecomCookie("corp-test", "wecom-disabled-001"),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
  await page.goto("/wecom/bind");
  await page.getByLabel("已有系统账号").fill("disabled001");
  await page.getByLabel("账号密码").fill(demoPassword);
  await page.getByRole("button", { name: "绑定并登录" }).click();

  await expect(page.getByText("账号已停用，不能绑定企业微信。")).toBeVisible();
});

test("wecom binding refuses to rebind a user already linked to another identity", async ({
  page
}) => {
  await page.context().addCookies([
    {
      name: "flowcore_wecom_pending",
      value: createPendingWecomCookie("corp-test", "wecom-pm-001"),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/wecom/bind");
  await page.getByLabel("已有系统账号").fill("pm001");
  await page.getByLabel("账号密码").fill(demoPassword);
  await page.getByRole("button", { name: "绑定并登录" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.context().addCookies([
    {
      name: "flowcore_wecom_pending",
      value: createPendingWecomCookie("corp-test", "wecom-pm-002"),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/wecom/bind");
  await page.getByLabel("已有系统账号").fill("pm001");
  await page.getByLabel("账号密码").fill(demoPassword);
  await page.getByRole("button", { name: "绑定并登录" }).click();

  await expect(page.getByText("该系统人员已绑定其他企业微信身份。")).toBeVisible();
});

function createPendingWecomCookie(corpId: string, wecomUserid: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      corpId,
      wecomUserid,
      expiresAt: Date.now() + 10 * 60 * 1000
    }),
    "utf8"
  ).toString("base64url");
  const signature = createHmac("sha256", authSecret).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}
