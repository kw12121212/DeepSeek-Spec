import { describe, expect, it } from "vitest";
import { shouldSkip, spawnPty } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("terminal: exit handling", () => {
  it("exits cleanly when /exit is sent", async () => {
    const handle = await spawnPty(["chat"]);

    await handle.waitUntil(/>|│/);

    handle.pty.write("/exit\r");

    const exitCode = await new Promise<number | null>((resolve) => {
      const timer = setTimeout(() => {
        handle.kill();
        resolve(null);
      }, 10_000);

      handle.pty.onExit(({ exitCode }) => {
        clearTimeout(timer);
        resolve(exitCode);
      });
    });

    expect(exitCode).toBe(0);
  });
});
