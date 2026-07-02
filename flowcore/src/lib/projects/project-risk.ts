import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { projectNodes, projects } from "../../db/schema";
import { toDateInputValue } from "./project-dates";

export type ProjectRiskLevel = "normal" | "watch" | "high" | "blocked";

export type ProjectRiskNode = {
  plannedDate: string;
  status: "not_started" | "in_progress" | "completed" | "disabled";
  blockedIssueCount: number;
};

export function calculateProjectRisk(
  nodes: ProjectRiskNode[],
  today = toDateInputValue(new Date())
): ProjectRiskLevel {
  const activeNodes = nodes.filter(
    (node) => node.status !== "completed" && node.status !== "disabled"
  );

  if (activeNodes.some((node) => node.blockedIssueCount > 0)) {
    return "blocked";
  }

  if (activeNodes.some((node) => node.plannedDate < today)) {
    return "high";
  }

  if (activeNodes.some((node) => node.plannedDate === today)) {
    return "watch";
  }

  return "normal";
}

export async function refreshProjectRisk(projectId: string): Promise<ProjectRiskLevel> {
  const nodes = await db
    .select({
      plannedDate: projectNodes.plannedDate,
      status: projectNodes.status,
      blockedIssueCount: projectNodes.blockedIssueCount
    })
    .from(projectNodes)
    .where(eq(projectNodes.projectId, projectId));
  const riskLevel = calculateProjectRisk(nodes);

  await db
    .update(projects)
    .set({ riskLevel, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  return riskLevel;
}
