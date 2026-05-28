import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const script = resolve(import.meta.dirname, "..", "scripts", "build-native.mjs");

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync("node", [script, ...args], {
      encoding: "utf-8",
      timeout: 10_000,
    });
    return { code: 0, stdout, stderr: "" };
  } catch (err: any) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
    };
  }
}

describe("build-native.mjs arg validation", () => {
  it("rejects an unknown --target value", () => {
    const result = run(["--target", "plan9-arm"]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("Unknown target");
  });

  it("rejects invocation with no flags", () => {
    const result = run([]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("Usage");
  });

  it("lists valid targets in the usage message", () => {
    const result = run([]);
    expect(result.stderr).toContain("linux-x64");
    expect(result.stderr).toContain("darwin-arm64");
    expect(result.stderr).toContain("windows-x64");
  });
});
