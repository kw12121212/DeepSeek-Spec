import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SkillStore } from "../src/skills.js";

const STRICT_SKILL_NAMES = [
  "strict-init",
  "strict-propose",
  "strict-apply",
  "strict-verify",
  "strict-review",
  "strict-archive",
  "strict-ship",
  "strict-cancel",
  "strict-brainstorm",
  "strict-modify",
  "strict-roadmap-recommend",
  "strict-roadmap-plan",
  "strict-auto",
] as const;

describe("strict builtin skills", () => {
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(`${tmpdir()}/strict-skills-test-`);
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  it("registers all 13 strict-spec skills", () => {
    const store = new SkillStore({ homeDir: home });
    const skills = store.list();
    const byName = new Map(skills.map((s) => [s.name, s]));
    for (const name of STRICT_SKILL_NAMES) {
      expect(byName.has(name), `missing builtin skill: ${name}`).toBe(true);
    }
    const strictSkills = skills.filter((s) => s.name.startsWith("strict-"));
    expect(strictSkills).toHaveLength(STRICT_SKILL_NAMES.length);
  });

  it("all strict skills are scope=builtin", () => {
    const store = new SkillStore({ homeDir: home });
    for (const name of STRICT_SKILL_NAMES) {
      const skill = store.read(name);
      expect(skill, `${name} should exist`).not.toBeNull();
      expect(skill!.scope, `${name}.scope`).toBe("builtin");
    }
  });

  it("all strict skills are runAs=inline", () => {
    const store = new SkillStore({ homeDir: home });
    for (const name of STRICT_SKILL_NAMES) {
      const skill = store.read(name);
      expect(skill, `${name} should exist`).not.toBeNull();
      expect(skill!.runAs, `${name}.runAs`).toBe("inline");
    }
  });

  it("all strict skills have non-empty description and body", () => {
    const store = new SkillStore({ homeDir: home });
    for (const name of STRICT_SKILL_NAMES) {
      const skill = store.read(name);
      expect(skill, `${name} should exist`).not.toBeNull();
      expect(skill!.description.length, `${name}.description`).toBeGreaterThan(0);
      expect(skill!.body.length, `${name}.body`).toBeGreaterThan(0);
    }
  });

  it("each strict skill is individually readable via read()", () => {
    const store = new SkillStore({ homeDir: home });
    for (const name of STRICT_SKILL_NAMES) {
      const skill = store.read(name);
      expect(skill, `read(${name}) should return a skill`).not.toBeNull();
      expect(skill!.name).toBe(name);
    }
  });
});
