import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { apiUrl, authHeaders, requireDashboard, shouldSkip, startDashboard } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("Dashboard scheduler status", () => {
  requireDashboard();

  it("returns correct structure from GET /api/scheduler/status", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/scheduler/status"), {
        headers: authHeaders(dashboard.token),
      });
      expect(res.ok).toBe(true);

      const body = (await res.json()) as Record<string, unknown>;
      expect(Array.isArray(body.tasks)).toBe(true);
      expect(typeof body.enabledCount).toBe("number");
      expect(typeof body.running).toBe("boolean");
      expect(body.nextRun === null || typeof body.nextRun === "string").toBe(true);
    } finally {
      dashboard.stop();
    }
  });

  it("renders scheduler status section in the SPA", async () => {
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
    } finally {
      dashboard.stop();
    }
  });
});
