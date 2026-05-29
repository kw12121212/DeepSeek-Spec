import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  collectMemoryEntriesForWorkspace,
  readMemoryEntryDetail,
} from "../src/desktop/memory-browser.js";
import { MemoryStore } from "../src/memory/user.js";

describe("desktop memory browser", () => {
  let root: string;
  let dspecHome: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "dspec-memory-project-"));
    dspecHome = join(mkdtempSync(join(tmpdir(), "dspec-memory-home-")), ".dspec");
    mkdirSync(dspecHome, { recursive: true });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(dspecHome, { recursive: true, force: true });
  });

  it("lists project DSPEC.md, global DSPEC.md, and structured memory entries", () => {
    writeFileSync(join(root, "DSPEC.md"), "project note", "utf8");
    writeFileSync(join(dspecHome, "DSPEC.md"), "global note", "utf8");
    const store = new MemoryStore({ homeDir: dspecHome, projectRoot: root });
    store.write({
      name: "cli_pref",
      scope: "global",
      type: "user",
      description: "Use concise CLI output",
      body: "Keep command output short.",
    });
    store.write({
      name: "build_cmd",
      scope: "project",
      type: "project",
      description: "Use npm run verify",
      body: "Run npm run verify before release.",
    });

    const entries = collectMemoryEntriesForWorkspace(root, { dspecHome });

    expect(entries.map((e) => `${e.kind}:${e.scope}:${e.name}`)).toEqual([
      "project_file:project:DSPEC.md",
      "global_file:global:DSPEC.md",
      "structured:global:cli_pref",
      "structured:project:build_cmd",
    ]);
    expect(entries.every((e) => existsSync(e.path))).toBe(true);
    expect(entries.find((e) => e.name === "cli_pref")!.type).toBe("user");
  });

  it("reads details only for listed memory files", () => {
    writeFileSync(join(root, "DSPEC.md"), "project note", "utf8");
    const entries = collectMemoryEntriesForWorkspace(root, { dspecHome });

    const detail = readMemoryEntryDetail({ path: entries[0]!.path }, root, { dspecHome });

    expect(detail).toMatchObject({
      kind: "project_file",
      scope: "project",
      name: "DSPEC.md",
      body: "project note",
    });
    expect(() =>
      readMemoryEntryDetail({ path: join(dspecHome, "not-listed.md") }, root, {
        dspecHome,
      }),
    ).toThrow(/not available/);
  });
});
