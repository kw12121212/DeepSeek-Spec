import { describe, expect, it } from "vitest";
import { describeCron, matchesCron, nextRun, parseCron } from "../../src/scheduler/cron-parser.js";

describe("parseCron", () => {
  it("parses wildcard expressions", () => {
    const fields = parseCron("* * * * *");
    expect(fields.minutes.size).toBe(60);
    expect(fields.hours.size).toBe(24);
    expect(fields.daysOfMonth.size).toBe(31);
    expect(fields.months.size).toBe(12);
    expect(fields.daysOfWeek.size).toBe(7);
  });

  it("parses step expressions", () => {
    const fields = parseCron("*/5 * * * *");
    expect(fields.minutes).toEqual(new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]));
  });

  it("parses range expressions", () => {
    const fields = parseCron("0 9 * * 1-5");
    expect(fields.minutes).toEqual(new Set([0]));
    expect(fields.hours).toEqual(new Set([9]));
    expect(fields.daysOfWeek).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("parses list expressions", () => {
    const fields = parseCron("0 0 * * 0,6");
    expect(fields.daysOfWeek).toEqual(new Set([0, 6]));
  });

  it("parses step with range", () => {
    const fields = parseCron("0 0 1-10/2 * *");
    expect(fields.daysOfMonth).toEqual(new Set([1, 3, 5, 7, 9]));
  });

  it("parses exact values", () => {
    const fields = parseCron("30 14 15 6 *");
    expect(fields.minutes).toEqual(new Set([30]));
    expect(fields.hours).toEqual(new Set([14]));
    expect(fields.daysOfMonth).toEqual(new Set([15]));
    expect(fields.months).toEqual(new Set([6]));
  });

  it("throws on wrong number of fields", () => {
    expect(() => parseCron("* * *")).toThrow("Invalid cron: expected 5 fields");
  });

  it("throws on out-of-range values", () => {
    expect(() => parseCron("60 * * * *")).toThrow("out of range");
  });

  it("throws on invalid range", () => {
    expect(() => parseCron("0 0 31-1 * *")).toThrow("invalid range");
  });
});

describe("matchesCron", () => {
  it("returns true when date matches", () => {
    const date = new Date(2024, 0, 1, 9, 0); // Monday Jan 1 2024, 09:00
    expect(matchesCron("0 9 * * 1-5", date)).toBe(true);
  });

  it("returns false when minute does not match", () => {
    const date = new Date(2024, 0, 1, 9, 5); // Monday Jan 1 2024, 09:05
    expect(matchesCron("0 9 * * 1-5", date)).toBe(false);
  });

  it("returns false when hour does not match", () => {
    const date = new Date(2024, 0, 1, 10, 0); // Monday Jan 1 2024, 10:00
    expect(matchesCron("0 9 * * 1-5", date)).toBe(false);
  });

  it("returns false when day-of-week does not match", () => {
    const date = new Date(2024, 0, 6, 9, 0); // Saturday Jan 6 2024, 09:00
    expect(matchesCron("0 9 * * 1-5", date)).toBe(false);
  });

  it("matches every 5 minutes", () => {
    const date = new Date(2024, 0, 1, 0, 15);
    expect(matchesCron("*/5 * * * *", date)).toBe(true);
  });

  it("does not match non-5-minute boundary", () => {
    const date = new Date(2024, 0, 1, 0, 7);
    expect(matchesCron("*/5 * * * *", date)).toBe(false);
  });
});

describe("nextRun", () => {
  it("returns next matching time on same day", () => {
    const from = new Date(2024, 0, 1, 8, 30); // 08:30
    const next = nextRun("0 9 * * *", from);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
    expect(next.getDate()).toBe(1);
  });

  it("returns next matching time on next day", () => {
    const from = new Date(2024, 0, 1, 10, 0); // 10:00
    const next = nextRun("0 9 * * *", from);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
    expect(next.getDate()).toBe(2);
  });

  it("returns next weekday match", () => {
    const from = new Date(2024, 0, 4, 10, 0); // Thursday Jan 4 2024, 10:00
    const next = nextRun("0 9 * * 1-5", from);
    expect(next.getHours()).toBe(9);
    expect(next.getDay()).toBe(5); // Friday
  });

  it("handles every-5-minutes expression", () => {
    const from = new Date(2024, 0, 1, 0, 3);
    const next = nextRun("*/5 * * * *", from);
    expect(next.getMinutes()).toBe(5);
  });

  it("throws when no match within 24 hours", () => {
    const from = new Date(2024, 0, 1, 0, 0);
    expect(() => nextRun("0 0 31 2 *", from)).toThrow("No matching time found");
  });
});

describe("describeCron", () => {
  it("describes every-N-minutes", () => {
    expect(describeCron("*/5 * * * *")).toBe("every 5 minutes");
  });

  it("describes every-N-hours", () => {
    expect(describeCron("0 */2 * * *")).toBe("every 2 hours at minute 0");
  });

  it("describes daily", () => {
    expect(describeCron("0 9 * * *")).toBe("daily at 09:00");
  });

  it("describes weekdays", () => {
    expect(describeCron("0 9 * * 1-5")).toBe("weekdays at 09:00");
  });

  it("describes weekends", () => {
    expect(describeCron("0 10 * * 0,6")).toBe("weekends at 10:00");
  });

  it("describes first of month", () => {
    expect(describeCron("0 0 1 * *")).toBe("first of every month at 00:00");
  });

  it("describes every minute", () => {
    expect(describeCron("* * * * *")).toBe("every minute");
  });

  it("falls back to raw expression for complex patterns", () => {
    expect(describeCron("15,45 3,7 10,20 3,6 *")).toBe("15,45 3,7 10,20 3,6 *");
  });
});
