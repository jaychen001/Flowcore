import { and, asc, desc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/db/client";
import {
  departments,
  importJobs,
  projectNodes,
  projects,
  roles,
  userRoles,
  users
} from "@/db/schema";

export type MasterDataSnapshot = Awaited<ReturnType<typeof getMasterDataSnapshot>>;
export type ImportJobDetail = Awaited<ReturnType<typeof getImportJobDetail>>;
export type ProjectDetail = Awaited<ReturnType<typeof getProjectDetail>>;

type DataAccessContext = {
  userId: string;
  canManageMasterData: boolean;
  canManageProjects: boolean;
};

export async function getMasterDataSnapshot(context: DataAccessContext) {
  noStore();

  const [departmentRows, roleRows, userRows, userRoleRows, projectRows, importJobRows] =
    await Promise.all([
      context.canManageMasterData
        ? db
            .select({
              id: departments.id,
              name: departments.name,
              type: departments.type,
              status: departments.status
            })
            .from(departments)
            .orderBy(asc(departments.name))
        : [],
      context.canManageMasterData
        ? db
            .select({
              id: roles.id,
              name: roles.name,
              permissions: roles.permissions,
              status: roles.status
            })
            .from(roles)
            .orderBy(asc(roles.name))
        : [],
      selectVisibleUsers(context),
      context.canManageMasterData ? db.select().from(userRoles) : [],
      context.canManageProjects ? selectProjects() : [],
      selectVisibleImportJobs(context)
    ]);
  const roleById = new Map(roleRows.map((role) => [role.id, role]));
  const roleIdsByUserId = new Map<string, string[]>();

  for (const userRole of userRoleRows) {
    roleIdsByUserId.set(userRole.userId, [
      ...(roleIdsByUserId.get(userRole.userId) ?? []),
      userRole.roleId
    ]);
  }

  return {
    departments: departmentRows,
    roles: roleRows,
    users: userRows.map((user) => {
      const roleIds = roleIdsByUserId.get(user.id) ?? [];

      return {
        id: user.id,
        name: user.name,
        account: user.account,
        departmentId: user.departmentId,
        status: user.status,
        wecomUserid: context.canManageMasterData ? user.wecomUserid : null,
        roleIds,
        roleNames: roleIds.map((roleId) => roleById.get(roleId)?.name).filter(Boolean)
      };
    }),
    projects: projectRows,
    importJobs: importJobRows
  };
}

export async function getImportJobDetail(jobId: string, context: DataAccessContext) {
  noStore();

  const visibilityCondition = context.canManageMasterData
    ? eq(importJobs.id, jobId)
    : context.canManageProjects
      ? and(
          eq(importJobs.id, jobId),
          eq(importJobs.importType, "projects"),
          eq(importJobs.createdBy, context.userId)
        )
      : undefined;

  if (!visibilityCondition) {
    return null;
  }

  const [job] = await db
    .select({
      id: importJobs.id,
      importType: importJobs.importType,
      fileName: importJobs.fileName,
      status: importJobs.status,
      successCount: importJobs.successCount,
      failedCount: importJobs.failedCount,
      errors: importJobs.errors,
      errorReportUrl: importJobs.errorReportUrl,
      createdBy: importJobs.createdBy,
      createdAt: importJobs.createdAt
    })
    .from(importJobs)
    .where(visibilityCondition)
    .limit(1);
  return job ?? null;
}

export async function getProjectDetail(projectId: string) {
  noStore();

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      ownerId: projects.ownerId,
      ownerName: users.name,
      plannedDeliveryDate: projects.plannedDeliveryDate,
      status: projects.status,
      riskLevel: projects.riskLevel
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  const [nodeRows, userRows] = await Promise.all([
    db
      .select()
      .from(projectNodes)
      .where(eq(projectNodes.projectId, projectId))
      .orderBy(asc(projectNodes.sequence)),
    db
      .select({
        id: users.id,
        name: users.name,
        account: users.account,
        status: users.status
      })
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(asc(users.name))
  ]);

  return {
    project,
    nodes: nodeRows,
    users: userRows
  };
}

function selectVisibleUsers(context: DataAccessContext) {
  const selectedColumns = {
    id: users.id,
    name: users.name,
    account: users.account,
    departmentId: users.departmentId,
    status: users.status,
    wecomUserid: users.wecomUserid
  };

  if (context.canManageMasterData) {
    return db.select(selectedColumns).from(users).orderBy(asc(users.name));
  }

  if (context.canManageProjects) {
    return db
      .select(selectedColumns)
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(asc(users.name));
  }

  return [];
}

function selectProjects() {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      ownerId: projects.ownerId,
      ownerName: users.name,
      plannedDeliveryDate: projects.plannedDeliveryDate,
      status: projects.status,
      riskLevel: projects.riskLevel
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .orderBy(asc(projects.name));
}

function selectVisibleImportJobs(context: DataAccessContext) {
  const selectedColumns = {
    id: importJobs.id,
    importType: importJobs.importType,
    fileName: importJobs.fileName,
    status: importJobs.status,
    successCount: importJobs.successCount,
    failedCount: importJobs.failedCount
  };

  if (context.canManageMasterData) {
    return db
      .select(selectedColumns)
      .from(importJobs)
      .orderBy(desc(importJobs.createdAt))
      .limit(20);
  }

  if (context.canManageProjects) {
    return db
      .select(selectedColumns)
      .from(importJobs)
      .where(and(eq(importJobs.importType, "projects"), eq(importJobs.createdBy, context.userId)))
      .orderBy(desc(importJobs.createdAt))
      .limit(20);
  }

  return [];
}
