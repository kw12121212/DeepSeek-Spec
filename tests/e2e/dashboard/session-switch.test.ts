import { describe, expect, it } from "vitest";
import { apiUrl, authHeaders, requireDashboard, shouldSkip, startDashboard } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("Dashboard session switching", () => {
  requireDashboard();

  it("returns a session array from GET /api/sessions", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/sessions"), {
        headers: authHeaders(dashboard.token),
      });
      expect(res.ok).toBe(true);

      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    } finally {
      dashboard.stop();
    }
  });

  it("returns current session info from GET /api/overview", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/overview"), {
        headers: authHeaders(dashboard.token),
      });
      expect(res.ok).toBe(true);

      const body = await res.json();
      expect(typeof body).toBe("object");
    } finally {
      dashboard.stop();
    }
  });
});
