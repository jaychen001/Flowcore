import { describe, expect, it } from "vitest";
import { buildDefaultProjectNodes, DEFAULT_PROJECT_NODE_NAMES } from "./default-nodes";

describe("buildDefaultProjectNodes", () => {
  it("creates the ten required automation project nodes", () => {
    const nodes = buildDefaultProjectNodes({
      projectId: "project-1",
      ownerId: "user-1",
      plannedDeliveryDate: "2026-08-31"
    });

    expect(nodes).toHaveLength(10);
    expect(nodes.map((node) => node.name)).toEqual([
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
    ]);
    expect(nodes.map((node) => node.name)).toEqual([...DEFAULT_PROJECT_NODE_NAMES]);
    expect(nodes.at(-1)?.plannedDate).toBe("2026-08-31");
    expect(nodes.every((node) => node.ownerId === "user-1")).toBe(true);
  });
});
