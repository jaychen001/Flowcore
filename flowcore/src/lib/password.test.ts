import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the original password and rejects a different password", async () => {
    const hash = await hashPassword("FlowCore@123456");

    expect(hash).not.toContain("FlowCore@123456");
    await expect(verifyPassword("FlowCore@123456", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
