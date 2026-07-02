import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "./client";
import { departments, roles, userRoles, users } from "./schema";
import { hashPassword } from "@/lib/password";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

const seedDepartments = [
  { id: "dept-project", name: "项目管理部", type: "project" },
  { id: "dept-rd", name: "研发部", type: "rd" },
  { id: "dept-after-sales", name: "售后服务部", type: "after_sales" }
];

const seedRoles = [
  { id: "role-admin", name: "admin" },
  { id: "role-project-manager", name: "project_manager" },
  { id: "role-rd-owner", name: "rd_owner" },
  { id: "role-after-sales", name: "after_sales" },
  { id: "role-viewer", name: "viewer" }
];

const seedUsers = [
  {
    id: "user-admin",
    name: "系统管理员",
    account: "admin",
    departmentId: "dept-project",
    roleId: "role-admin"
  },
  {
    id: "user-project-manager",
    name: "项目负责人",
    account: "pm001",
    departmentId: "dept-project",
    roleId: "role-project-manager"
  },
  {
    id: "user-after-sales",
    name: "售后人员",
    account: "service001",
    departmentId: "dept-after-sales",
    roleId: "role-after-sales"
  },
  {
    id: "user-disabled",
    name: "停用账号",
    account: "disabled001",
    departmentId: "dept-project",
    roleId: "role-viewer",
    status: "disabled" as const
  }
];

async function main() {
  for (const department of seedDepartments) {
    await db
      .insert(departments)
      .values({ ...department, status: "active" })
      .onConflictDoNothing();
  }

  for (const role of seedRoles) {
    const permissions = ROLE_PERMISSIONS[role.name as keyof typeof ROLE_PERMISSIONS] ?? [];
    await db
      .insert(roles)
      .values({ ...role, permissions: [...permissions], status: "active" })
      .onConflictDoNothing();
  }

  const passwordHash = await hashPassword(getSeedPassword());

  for (const user of seedUsers) {
    await db
      .insert(users)
      .values({
        id: user.id,
        name: user.name,
        account: user.account,
        email: `${user.account}@flowcore.local`,
        passwordHash,
        departmentId: user.departmentId,
        status: user.status ?? "active"
      })
      .onConflictDoNothing();

    await db
      .insert(userRoles)
      .values({
        userId: user.id,
        roleId: user.roleId
      })
      .onConflictDoNothing();
  }

  console.log("Seed complete.");
}

function getSeedPassword(): string {
  const seedPassword = process.env.FLOWCORE_SEED_PASSWORD;

  if (!seedPassword) {
    throw new Error("FLOWCORE_SEED_PASSWORD is required for local seed data.");
  }

  return seedPassword;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
