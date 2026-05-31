import { describe, expect, it } from "vitest";
import { binaryExists, spawnBinary } from "./helper";

describe.skipIf(!binaryExists())("cli: error paths", () => {
  it("exits non-zero for unknown subcommand", async () => {
    const result = await spawnBinary(["nonexistent-command"], { timeout: 10_000 });
    expect(result.exitCode).not.toBe(0);
  });

  it("reports error in stderr", async () => {
    const result = await spawnBinary(["nonexistent-command"], { timeout: 10_000 });
    const combined = result.stderr + result.stdout;
    expect(combined.toLowerCase()).toMatch(/unknown|error|not found|invalid/);
  });
});
