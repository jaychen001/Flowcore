import { randomUUID } from "node:crypto";
import { addDays, parseDateInputValue, toDateInputValue } from "./project-dates";

export const DEFAULT_PROJECT_NODE_NAMES = [
  "项目立项",
  "机械 / 电气设计完成",
  "采购下单完成",
  "物料齐套",
  "生产装配完成",
  "内部调试完成",
  "发货",
  "客户现场安装 / 调试",
  "客户验收",
  "项目交付关闭"
] as const;

export type DefaultProjectNodeInput = {
  projectId: string;
  ownerId: string;
  plannedDeliveryDate: string;
};

export function buildDefaultProjectNodes({
  projectId,
  ownerId,
  plannedDeliveryDate
}: DefaultProjectNodeInput) {
  const deliveryDate = parseDateInputValue(plannedDeliveryDate);
  const startDate = addDays(deliveryDate, -7 * (DEFAULT_PROJECT_NODE_NAMES.length - 1));

  return DEFAULT_PROJECT_NODE_NAMES.map((name, index) => ({
    id: randomUUID(),
    projectId,
    name,
    sequence: index + 1,
    plannedDate: toDateInputValue(addDays(startDate, index * 7)),
    ownerId,
    status: "not_started" as const,
    blockedIssueCount: 0
  }));
}
