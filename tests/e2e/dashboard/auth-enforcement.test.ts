import { describe, expect, it } from "vitest";
import { apiUrl, authHeaders, requireDashboard, shouldSkip, startDashboard } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("Dashboard auth enforcement", () => {
  requireDashboard();

  it("rejects requests without a token with 401", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/sessions"));
      expect(res.status).toBe(401);
    } finally {
      dashboard.stop();
    }
  });

  it("accepts GET with token via query parameter", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, `/api/sessions?token=${dashboard.token}`));
      expect(res.ok).toBe(true);
    } finally {
      dashboard.stop();
    }
  });

  it("accepts GET with token via X-Dspec-Token header", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/sessions"), {
        headers: authHeaders(dashboard.token),
      });
      expect(res.ok).toBe(true);
    } finally {
      dashboard.stop();
    }
  });

  it("rejects POST with token only in query parameter (CSRF)", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, `/api/submit?token=${dashboard.token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "test" }),
      });
      expect(res.status).toBe(401);
    } finally {
      dashboard.stop();
    }
  });

  it("accepts POST with token in X-Dspec-Token header", async () => {
    const dashboard = await startDashboard();
    try {
      const res = await fetch(apiUrl(dashboard, "/api/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(dashboard.token),
        },
        body: JSON.stringify({ prompt: "test" }),
      });
      expect(res.status).not.toBe(401);
    } finally {
      dashboard.stop();
    }
  });
});
