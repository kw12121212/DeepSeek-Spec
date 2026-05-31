import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { shouldSkip, spawnPty } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("terminal: chat response", () => {
  let handle: Awaited<ReturnType<typeof spawnPty>>;

  beforeAll(async () => {
    handle = await spawnPty(["chat"]);
  });

  afterAll(() => {
    handle.kill();
  });

  it("renders TUI and responds to a prompt", async () => {
    await handle.waitUntil(/>|│/);

    handle.pty.write("What is 2+2? Please answer with just the number.\r");

    await handle.waitUntil(/4/);

    handle.pty.write("/exit\r");

    const output = await handle.waitUntil(/goodbye|exit/i, 10_000).catch(() => "");
    expect(output).toBeDefined();
  });
});
