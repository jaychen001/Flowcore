import { describe, expect, it } from "vitest";
import { appNavItems } from "./navigation";

describe("FlowCore navigation", () => {
  it("keeps the sidebar limited to the four main modules from the design brief", () => {
    expect(appNavItems.map((item) => item.href)).toEqual([
      "/dashboard",
      "/issues",
      "/todos",
      "/base-data"
    ]);
  });
});
