import { describe, expect, it } from "vitest";
import { binaryExists, spawnBinary } from "./helper";

describe.skipIf(!binaryExists())("cli: doctor", () => {
  it("exits with code 0 or 1", async () => {
    const result = await spawnBinary(["doctor", "--json"], { timeout: 10_000 });
    expect(result.exitCode === 0 || result.exitCode === 1).toBe(true);
  });

  it("outputs valid JSON", async () => {
    const result = await spawnBinary(["doctor", "--json"], { timeout: 10_000 });
    const parsed = JSON.parse(result.stdout);
    expect(typeof parsed).toBe("object");
    expect(parsed).not.toBeNull();
  });
});
