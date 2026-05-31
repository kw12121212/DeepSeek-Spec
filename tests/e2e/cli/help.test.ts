import { describe, expect, it } from "vitest";
import { binaryExists, spawnBinary } from "./helper";

describe.skipIf(!binaryExists())("cli: --help", () => {
  it("exits with code 0", async () => {
    const result = await spawnBinary(["--help"], { timeout: 10_000 });
    expect(result.exitCode).toBe(0);
  });

  it("lists subcommands in output", async () => {
    const result = await spawnBinary(["--help"], { timeout: 10_000 });
    const output = result.stdout;
    for (const cmd of ["code", "chat", "run", "setup", "doctor", "sessions"]) {
      expect(output).toContain(cmd);
    }
  });

  it("contains DeepSeek-Spec branding", async () => {
    const result = await spawnBinary(["--help"], { timeout: 10_000 });
    expect(result.stdout).toContain("DeepSeek-Spec");
  });
});
