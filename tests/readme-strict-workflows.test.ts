import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("README Strict Workflows section", () => {
  it("should contain 'Strict Spec Workflows' section", () => {
    const readme = fs.readFileSync(path.resolve(__dirname, "../README.md"), "utf-8");
    expect(readme).toContain("Strict Spec Workflows");
  });
});
