import { describe, expect, it } from "vitest";
import { fuzzyMatch, fuzzySlashCommands, nearestCommands } from "../src/cli/ui/slash/nearest.js";

describe("fuzzyMatch", () => {
  it("returns 0 for empty input or target", () => {
    expect(fuzzyMatch("", "abc")).toBe(0);
    expect(fuzzyMatch("abc", "")).toBe(0);
  });

  it("returns 0 when input chars cannot all be found in order", () => {
    expect(fuzzyMatch("xyz", "abc")).toBe(0);
  });

  it("scores exact prefix match highly", () => {
    const score = fuzzyMatch("stat", "status");
    expect(score).toBeGreaterThan(0);
  });

  it("scores fuzzy match lower than prefix match of same length", () => {
    const prefix = fuzzyMatch("st", "status");
    const fuzzy = fuzzyMatch("st", "cost");
    expect(prefix).toBeGreaterThan(fuzzy);
  });

  it("gives first-char bonus", () => {
    const firstChar = fuzzyMatch("s", "status");
    const notFirst = fuzzyMatch("t", "status");
    expect(firstChar).toBeGreaterThan(notFirst);
  });

  it("gives consecutive match bonus", () => {
    const consecutive = fuzzyMatch("st", "status");
    const spread = fuzzyMatch("su", "status");
    expect(consecutive).toBeGreaterThan(spread);
  });

  it("is case-insensitive", () => {
    expect(fuzzyMatch("ST", "status")).toBe(fuzzyMatch("st", "status"));
  });
});

describe("fuzzySlashCommands", () => {
  const cmds = [
    { cmd: "strict-init" },
    { cmd: "strict-apply" },
    { cmd: "strict-archive" },
    { cmd: "status" },
    { cmd: "skill" },
    { cmd: "sessions", aliases: ["ss"] },
    { cmd: "save" },
    { cmd: "setup" },
  ];

  it("returns commands matching fuzzy input sorted by score", () => {
    const results = fuzzySlashCommands("si", cmds);
    const names = results.map((r) => r.cmd);
    expect(names).toContain("strict-init");
    expect(names).toContain("skill");
  });

  it("respects max option", () => {
    const results = fuzzySlashCommands("s", cmds, { max: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("respects minScore option", () => {
    const results = fuzzySlashCommands("zzz", cmds, { minScore: 100 });
    expect(results).toEqual([]);
  });

  it("uses alias for scoring", () => {
    const results = fuzzySlashCommands("ss", cmds);
    const names = results.map((r) => r.cmd);
    expect(names).toContain("sessions");
  });

  it("deduplicates by cmd", () => {
    const results = fuzzySlashCommands("st", cmds);
    const cmdsSeen = new Set<string>();
    for (const r of results) {
      expect(cmdsSeen.has(r.cmd)).toBe(false);
      cmdsSeen.add(r.cmd);
    }
  });
});

describe("nearestCommands", () => {
  it("still works unchanged", () => {
    const results = nearestCommands("stat", ["status", "stats", "stop"]);
    expect(results).toContain("stats");
    expect(results).toContain("status");
  });
});
