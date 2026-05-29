import { describe, expect, it } from "vitest";
import { suggestSlashCommands } from "../src/cli/ui/slash/commands.js";

describe("suggestSlashCommands", () => {
  it("returns prefix matches for single char without fuzzy", () => {
    const results = suggestSlashCommands("s");
    const names = results.map((c) => c.cmd);
    expect(names).toContain("status");
    expect(names).toContain("stop");
  });

  it("includes fuzzy matches for 2+ char input", () => {
    const results = suggestSlashCommands("si");
    const names = results.map((c) => c.cmd);
    expect(names).toContain("strict-init");
  });

  it("places prefix matches before fuzzy matches", () => {
    const results = suggestSlashCommands("st");
    const names = results.map((c) => c.cmd);
    const prefixIdx = names.indexOf("status");
    const strictInitIdx = names.indexOf("strict-init");
    if (prefixIdx >= 0 && strictInitIdx >= 0) {
      expect(prefixIdx).toBeLessThan(strictInitIdx);
    }
  });

  it("does not duplicate prefix-matched commands in fuzzy results", () => {
    const results = suggestSlashCommands("st");
    const names = results.map((c) => c.cmd);
    const seen = new Set<string>();
    for (const n of names) {
      expect(seen.has(n)).toBe(false);
      seen.add(n);
    }
  });

  it("returns full menu for empty prefix", () => {
    const results = suggestSlashCommands("");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.group !== "advanced")).toBe(true);
  });

  it("filters code-contextual commands when not in code mode", () => {
    const results = suggestSlashCommands("co");
    const names = results.map((c) => c.cmd);
    expect(names).toContain("compact");
    expect(names).toContain("cost");
    expect(names).toContain("context");
    expect(names).not.toContain("commit");
  });
});
