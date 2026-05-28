import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "ink";
import React, { useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusRow } from "../src/cli/ui/layout/StatusRow.js";
import { AgentStoreProvider, useAgentStore } from "../src/cli/ui/state/provider.js";
import type { SessionInfo } from "../src/cli/ui/state/state.js";
import { makeFakeStdin, makeFakeStdout } from "./helpers/ink-stdio.js";

let fixtureDir: string;

function makeProposalYaml(status: string): string {
  return `schema: strict-spec-driven/change-proposal/v1
change:
  id: test-change
  status: ${status}
`;
}

function makeChangeDir(root: string, name: string, status: string): void {
  const dir = join(root, ".strict-spec-driven/changes", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "proposal.yaml"), makeProposalYaml(status));
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

function StateInjector({
  overrides,
  children,
}: {
  overrides: Record<string, unknown>;
  children: React.ReactNode;
}): React.ReactElement {
  const store = useAgentStore();
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only dispatch
  useEffect(() => {
    store.dispatch({ type: "session.update", patch: overrides } as never);
  }, []);
  return React.createElement(React.Fragment, null, children);
}

async function renderStatusRow(workspace: string): Promise<string> {
  const session: SessionInfo = {
    id: "default",
    branch: "main",
    workspace,
    model: "deepseek-chat",
  };
  const stdout = makeFakeStdout();
  const { unmount } = render(
    <AgentStoreProvider session={session}>
      <StateInjector overrides={{ mode: "auto", cacheHit: 0 }}>
        <StatusRow />
      </StateInjector>
    </AgentStoreProvider>,
    { stdout: stdout as never, stdin: makeFakeStdin() as never },
  );
  await new Promise((r) => setTimeout(r, 250));
  unmount();
  return stdout.text();
}

describe("StrictStatusPill", () => {
  afterEach(cleanup);

  it("renders change name and state when active change exists", async () => {
    fixtureDir = join(tmpdir(), `pill-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "my-change", "applied");
    const text = await renderStatusRow(fixtureDir);
    expect(text).toContain("strict: my-change [applied]");
  });

  it("renders nothing when no active changes", async () => {
    fixtureDir = join(tmpdir(), `pill-test-${Date.now()}`);
    mkdirSync(join(fixtureDir, ".strict-spec-driven/changes"), { recursive: true });
    const text = await renderStatusRow(fixtureDir);
    expect(text).not.toContain("strict:");
  });

  it("truncates long change name at 20 characters", async () => {
    fixtureDir = join(tmpdir(), `pill-test-${Date.now()}`);
    const longName = "a-very-long-change-name-that-exceeds-twenty-chars";
    makeChangeDir(fixtureDir, longName, "proposed");
    const text = await renderStatusRow(fixtureDir);
    expect(text).toContain("strict: a-very-long-change-n… [proposed]");
  });

  it("shows +N suffix for multiple active changes", async () => {
    fixtureDir = join(tmpdir(), `pill-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "first", "applied");
    makeChangeDir(fixtureDir, "second", "verified");
    const text = await renderStatusRow(fixtureDir);
    expect(text).toContain("+1");
  });
});
