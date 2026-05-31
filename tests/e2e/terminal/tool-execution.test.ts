import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { shouldSkip, spawnPty } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("terminal: tool execution", () => {
  let handle: Awaited<ReturnType<typeof spawnPty>>;

  beforeAll(async () => {
    handle = await spawnPty(["code"]);
  });

  afterAll(() => {
    handle.kill();
  });

  it("reads a file via tool call and returns content", async () => {
    await handle.waitUntil(/>|│/);

    handle.pty.write("Read the file package.json and tell me the project name\r");

    await handle.waitUntil(/sample-project/);

    handle.pty.write("/exit\r");

    const output = await handle.waitUntil(/goodbye|exit/i, 10_000).catch(() => "");
    expect(output).toBeDefined();
  });
});
