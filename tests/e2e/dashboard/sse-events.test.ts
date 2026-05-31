import { describe, expect, it } from "vitest";
import { apiUrl, authHeaders, requireDashboard, shouldSkip, startDashboard } from "./helper";

const skip = shouldSkip();

describe.skipIf(skip)("Dashboard SSE events", () => {
  requireDashboard();

  it("streams live events after prompt submission", async () => {
    const dashboard = await startDashboard();
    try {
      const events: string[] = [];
      const sseUrl = apiUrl(dashboard, "/api/events");

      const eventSource = new EventSource(`${sseUrl}?token=${dashboard.token}`);
      eventSource.onmessage = (e) => {
        events.push(e.data);
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const submitUrl = apiUrl(dashboard, "/api/submit");
      await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(dashboard.token),
        },
        body: JSON.stringify({ prompt: "Say hello" }),
      });

      await new Promise((resolve) => setTimeout(resolve, 30_000));

      eventSource.close();
      expect(events.length).toBeGreaterThan(0);

      const eventTypes = events.map((e) => {
        try {
          return JSON.parse(e).type;
        } catch {
          return null;
        }
      });
      expect(eventTypes.some((t) => t !== null)).toBe(true);
    } finally {
      dashboard.stop();
    }
  });
});
