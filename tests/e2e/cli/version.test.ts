import { describe, expect, it } from "vitest";
import { binaryExists, spawnBinary } from "./helper";

describe.skipIf(!binaryExists())("cli: version", () => {
  it("exits with code 0", async () => {
    const result = await spawnBinary(["version"], { timeout: 10_000 });
    expect(result.exitCode).toBe(0);
  });

  it("outputs a semver version string", async () => {
    const result = await spawnBinary(["version"], { timeout: 10_000 });
    expect(result.stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
  });
});
