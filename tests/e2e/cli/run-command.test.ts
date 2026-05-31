import { describe, expect, it } from "vitest";
import { createFixtureWorktree } from "../helpers/fixture";
import { binaryExists, requireLlmConfig, spawnBinary } from "./helper";

describe.skipIf(!binaryExists())("cli: run", () => {
  it("responds to a simple prompt", async () => {
    requireLlmConfig();

    const { dir, cleanup } = createFixtureWorktree();
    try {
      const result = await spawnBinary(["run", "What is 2+2?"], {
        cwd: dir,
        timeout: 60_000,
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    } finally {
      cleanup();
    }
  });
});
