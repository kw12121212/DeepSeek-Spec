import { beforeEach, describe, expect, it, vi } from "vitest";
import { runAutoPipeline, runFreeformPipeline } from "../src/strict/auto-pipeline";
import { invokeStrict } from "../src/strict/invoker";
import { propose } from "../src/strict/propose";

vi.mock("../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

vi.mock("../src/strict/propose", () => ({
  propose: vi.fn(),
}));

vi.mock("../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

const OK = { ok: true as const };
const FAIL = (error: string) => ({ ok: false as const, error });

beforeEach(() => {
  vi.mocked(invokeStrict).mockReset();
});

function mockInvokeStrict(
  results: Record<string, { ok: boolean; error?: string; data?: unknown }>,
) {
  const fn = vi.mocked(invokeStrict);
  fn.mockImplementation((subcommand: string) => {
    const r = results[subcommand];
    if (r === undefined) return Promise.resolve(OK);
    return Promise.resolve(r);
  });
}

function makePassingGate() {
  return () => Promise.resolve({ ok: true });
}

function makeFailingGate(error: string, failAfter: number) {
  let calls = 0;
  return () => {
    calls++;
    if (calls > failAfter) return Promise.resolve({ ok: false, error });
    return Promise.resolve({ ok: true });
  };
}

describe("runAutoPipeline", () => {
  it("executes all six steps in order when all gates pass", async () => {
    mockInvokeStrict({});

    const result = await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeUndefined();
    expect(result.completed).toHaveLength(6);
    expect(result.completed.map((s) => s.step)).toEqual([
      "recommend",
      "apply",
      "verify",
      "review",
      "archive",
      "ship",
    ]);
    expect(result.synced).toBe(true);

    const fn = vi.mocked(invokeStrict);
    expect(fn).toHaveBeenCalledWith(
      "roadmap-recommend",
      expect.objectContaining({ cwd: process.cwd() }),
    );
    expect(fn).toHaveBeenCalledWith("apply", expect.objectContaining({ args: ["test-change"] }));
    expect(fn).toHaveBeenCalledWith("verify", expect.objectContaining({ args: ["test-change"] }));
    expect(fn).toHaveBeenCalledWith("ready", expect.objectContaining({ args: ["test-change"] }));
    expect(fn).toHaveBeenCalledWith("archive", expect.objectContaining({ args: ["test-change"] }));
    expect(fn).toHaveBeenCalledWith("roadmap-sync", expect.any(Object));
    expect(fn).toHaveBeenCalledWith("ship", expect.objectContaining({ args: ["test-change"] }));
  });

  it("pauses and returns error when a step fails", async () => {
    mockInvokeStrict({
      verify: FAIL("verification failed"),
    });

    const result = await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeDefined();
    expect(result.failed!.step).toBe("verify");
    expect(result.failed!.ok).toBe(false);
    expect(result.failed!.error).toBe("verification failed");
    expect(result.completed).toHaveLength(2);
    expect(result.completed.map((s) => s.step)).toEqual(["recommend", "apply"]);
  });

  it("pauses when gate check fails", async () => {
    mockInvokeStrict({});

    const result = await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: makeFailingGate("test failed", 2),
    });

    expect(result.failed).toBeDefined();
    expect(result.failed!.step).toBe("verify");
    expect(result.failed!.error).toContain("gate check failed");
    expect(result.completed).toHaveLength(2);
  });

  it("resumes from --from step skipping earlier steps", async () => {
    mockInvokeStrict({});

    const result = await runAutoPipeline({
      changeName: "test-change",
      from: "verify",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeUndefined();
    expect(result.completed).toHaveLength(4);
    expect(result.completed.map((s) => s.step)).toEqual(["verify", "review", "archive", "ship"]);
  });

  it("calls roadmap-sync exactly once after archive", async () => {
    mockInvokeStrict({});

    const result = await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: makePassingGate(),
    });

    expect(result.synced).toBe(true);
    const fn = vi.mocked(invokeStrict);
    const syncCalls = fn.mock.calls.filter((c) => c[0] === "roadmap-sync");
    expect(syncCalls).toHaveLength(1);
  });

  it("returns synced=false if roadmap-sync fails", async () => {
    mockInvokeStrict({ "roadmap-sync": FAIL("sync error") });

    const result = await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: makePassingGate(),
    });

    expect(result.synced).toBe(false);
    expect(result.completed).toHaveLength(6);
  });

  it("skips gate check on ship step", async () => {
    let gateCalls = 0;
    const gateFn = () => {
      gateCalls++;
      return Promise.resolve({ ok: true });
    };

    mockInvokeStrict({});

    await runAutoPipeline({
      changeName: "test-change",
      gateCheckFn: gateFn,
    });

    expect(gateCalls).toBe(5);
  });
});

describe("runFreeformPipeline", () => {
  it("executes propose then remaining five steps when all gates pass", async () => {
    vi.mocked(propose).mockResolvedValue({
      ok: true,
      changeName: "test-change",
      directory: "/project/.strict-spec-driven/changes/test-change",
    });
    mockInvokeStrict({});

    const result = await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeUndefined();
    expect(result.completed).toHaveLength(6);
    expect(result.completed.map((s) => s.step)).toEqual([
      "propose",
      "apply",
      "verify",
      "review",
      "archive",
      "ship",
    ]);
    expect(result.synced).toBe(true);
    expect(propose).toHaveBeenCalledWith(
      process.cwd(),
      expect.objectContaining({ changeName: "test-change", description: "add feature X" }),
    );
  });

  it("returns failure when propose step fails", async () => {
    vi.mocked(propose).mockResolvedValue({
      ok: false,
      error: "change already exists",
    });

    const result = await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeDefined();
    expect(result.failed!.step).toBe("propose");
    expect(result.failed!.ok).toBe(false);
    expect(result.failed!.error).toBe("change already exists");
    expect(result.completed).toHaveLength(0);
  });

  it("pauses when a step after propose fails", async () => {
    vi.mocked(propose).mockResolvedValue({
      ok: true,
      changeName: "test-change",
      directory: "/project/.strict-spec-driven/changes/test-change",
    });
    mockInvokeStrict({ verify: FAIL("verification failed") });

    const result = await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: makePassingGate(),
    });

    expect(result.failed).toBeDefined();
    expect(result.failed!.step).toBe("verify");
    expect(result.completed).toHaveLength(2);
    expect(result.completed.map((s) => s.step)).toEqual(["propose", "apply"]);
  });

  it("pauses when gate check fails", async () => {
    vi.mocked(propose).mockResolvedValue({
      ok: true,
      changeName: "test-change",
      directory: "/project/.strict-spec-driven/changes/test-change",
    });
    mockInvokeStrict({});

    const result = await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: makeFailingGate("test failed", 2),
    });

    expect(result.failed).toBeDefined();
    expect(result.failed!.step).toBe("verify");
    expect(result.failed!.error).toContain("gate check failed");
    expect(result.completed).toHaveLength(2);
  });

  it("calls roadmap-sync after archive and sets synced true", async () => {
    vi.mocked(propose).mockResolvedValue({
      ok: true,
      changeName: "test-change",
      directory: "/project/.strict-spec-driven/changes/test-change",
    });
    mockInvokeStrict({});

    const result = await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: makePassingGate(),
    });

    expect(result.synced).toBe(true);
    const syncCalls = vi.mocked(invokeStrict).mock.calls.filter((c) => c[0] === "roadmap-sync");
    expect(syncCalls).toHaveLength(1);
  });

  it("skips gate check on ship step", async () => {
    let gateCalls = 0;
    const gateFn = () => {
      gateCalls++;
      return Promise.resolve({ ok: true });
    };
    vi.mocked(propose).mockResolvedValue({
      ok: true,
      changeName: "test-change",
      directory: "/project/.strict-spec-driven/changes/test-change",
    });
    mockInvokeStrict({});

    await runFreeformPipeline({
      changeName: "test-change",
      description: "add feature X",
      gateCheckFn: gateFn,
    });

    expect(gateCalls).toBe(5);
  });
});
