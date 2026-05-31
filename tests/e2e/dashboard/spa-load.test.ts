import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { requireDashboard, shouldSkip, startDashboard } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("Dashboard SPA load", () => {
  requireDashboard();

  it("renders the main layout when accessed with a valid token", async () => {
    const dashboard = await startDashboard();
    try {
      execSync(`agent-browser open "${dashboard.url}"`, {
        timeout: 15_000,
        stdio: "pipe",
      });

      const snapshot = execSync("agent-browser snapshot", {
        timeout: 10_000,
        stdio: "pipe",
      }).toString();

      expect(snapshot.length).toBeGreaterThan(0);

      const screenshot = execSync("agent-browser screenshot", {
        timeout: 10_000,
        stdio: "pipe",
      });

      expect(screenshot.byteLength).toBeGreaterThan(0);
    } finally {
      dashboard.stop();
    }
  });
});
