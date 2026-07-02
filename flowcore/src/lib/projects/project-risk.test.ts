import { describe, expect, it } from "vitest";
import { calculateProjectRisk } from "./project-risk";

describe("calculateProjectRisk", () => {
  it("marks unfinished nodes due today as watch", () => {
    expect(
      calculateProjectRisk(
        [{ plannedDate: "2026-07-02", status: "not_started", blockedIssueCount: 0 }],
        "2026-07-02"
      )
    ).toBe("watch");
  });

  it("marks overdue unfinished nodes as high", () => {
    expect(
      calculateProjectRisk(
        [{ plannedDate: "2026-07-01", status: "in_progress", blockedIssueCount: 0 }],
        "2026-07-02"
      )
    ).toBe("high");
  });

  it("marks blocked nodes above date risk", () => {
    expect(
      calculateProjectRisk(
        [{ plannedDate: "2026-08-01", status: "not_started", blockedIssueCount: 1 }],
        "2026-07-02"
      )
    ).toBe("blocked");
  });
});
