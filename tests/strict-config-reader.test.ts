import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createConfigReader } from "../src/strict/config-reader.js";

let fixtureDir: string;

function makeFixture(configYaml?: string): string {
  fixtureDir = join(tmpdir(), `config-reader-test-${Date.now()}`);
  mkdirSync(fixtureDir, { recursive: true });
  if (configYaml !== undefined) {
    const strictDir = join(fixtureDir, ".strict-spec-driven");
    mkdirSync(strictDir, { recursive: true });
    writeFileSync(join(strictDir, "config.yaml"), configYaml);
  }
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("createConfigReader", () => {
  afterEach(cleanup);

  it("returns defaults when config.yaml is missing", () => {
    const root = makeFixture();
    const reader = createConfigReader(root);
    expect(reader.getContext()).toBe("");
    expect(reader.getRules()).toEqual({
      specs: [],
      change: [],
      code: [],
      test: [],
    });
    expect(reader.getReviewEvidence()).toEqual({});
  });

  it("parses a full config.yaml", () => {
    const root = makeFixture(`
context: "hello world"
rules:
  specs:
    - "spec rule 1"
  change:
    - "change rule 1"
  code:
    - "code rule 1"
  test:
    - "test rule 1"
review_evidence:
  project_regression:
    method: full
    command: "npm test"
    meaning: "must pass"
    unavailable_behavior: "block"
`);
    const reader = createConfigReader(root);
    expect(reader.getContext()).toBe("hello world");
    expect(reader.getRules().specs).toEqual(["spec rule 1"]);
    expect(reader.getRules().change).toEqual(["change rule 1"]);
    expect(reader.getReviewEvidence().project_regression?.command).toBe("npm test");
  });

  it("returns defaults for missing individual fields", () => {
    const root = makeFixture(`
context: "partial"
`);
    const reader = createConfigReader(root);
    expect(reader.getContext()).toBe("partial");
    expect(reader.getRules()).toEqual({
      specs: [],
      change: [],
      code: [],
      test: [],
    });
    expect(reader.getReviewEvidence()).toEqual({});
  });

  it("caches the parsed config on repeated access", () => {
    const root = makeFixture(`context: "cached"`);
    const reader = createConfigReader(root);
    const config1 = reader.getConfig();
    const config2 = reader.getConfig();
    expect(config1).toBe(config2);
  });

  it("caches across different accessors", () => {
    const root = makeFixture(`context: "cross-accessor"`);
    const reader = createConfigReader(root);
    const context = reader.getContext();
    const config = reader.getConfig();
    expect(context).toBe(config.context);
  });

  it("throws on invalid YAML with unparseable syntax", () => {
    const root = makeFixture(`
context: "ok"
rules: [not: valid: yaml:
`);
    const reader = createConfigReader(root);
    expect(() => reader.getConfig()).toThrow();
  });
});
