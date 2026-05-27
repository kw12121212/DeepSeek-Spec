import { describe, expect, it } from "vitest";
import { brainstorm, isValidSummary } from "../src/strict/brainstorm.js";

describe("isValidSummary", () => {
  it("rejects null", () => {
    expect(isValidSummary(null)).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(isValidSummary({})).toBe(false);
  });

  it("accepts a complete summary", () => {
    expect(
      isValidSummary({
        title: "Add brainstorm tool",
        goal: "Create interactive brainstorming",
        scope: { in: ["src/strict/brainstorm.ts"], out: ["src/loop.ts"] },
        done_criteria: ["brainstorm() returns structured output"],
      }),
    ).toBe(true);
  });

  it("rejects empty done_criteria", () => {
    expect(
      isValidSummary({
        title: "X",
        goal: "Y",
        scope: { in: [], out: [] },
        done_criteria: [],
      }),
    ).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      isValidSummary({
        title: "  ",
        goal: "Y",
        scope: { in: ["a"], out: [] },
        done_criteria: ["z"],
      }),
    ).toBe(false);
  });
});

describe("brainstorm", () => {
  it("returns questions when no summary is provided", () => {
    const result = brainstorm({ idea: "add logging" });
    expect(result.phase).toBe("questions");
    if (result.phase === "questions") {
      expect(result.questions.length).toBeGreaterThan(0);
    }
  });

  it("returns questions including the idea text on first call", () => {
    const result = brainstorm({ idea: "refactor config" });
    expect(result.phase).toBe("questions");
    if (result.phase === "questions") {
      expect(result.questions[0]).toContain("refactor config");
    }
  });

  it("returns summary when a valid summary is provided", () => {
    const summary = {
      title: "Add brainstorm tool",
      goal: "Create interactive brainstorming",
      scope: { in: ["src/strict/brainstorm.ts"], out: [] },
      done_criteria: ["tool is registered"],
    };
    const result = brainstorm({ summary });
    expect(result.phase).toBe("summary");
    if (result.phase === "summary") {
      expect(result.summary.title).toBe("Add brainstorm tool");
    }
  });

  it("does not create files when summary is rejected", () => {
    const result = brainstorm({ idea: "something" });
    expect(result.phase).toBe("questions");
  });

  it("returns questions for partial summary with missing title", () => {
    const result = brainstorm({
      summary: {
        goal: "do things",
        scope: { in: ["a"], out: [] },
        done_criteria: ["done"],
      },
    });
    expect(result.phase).toBe("questions");
    if (result.phase === "questions") {
      expect(result.questions.some((q) => q.toLowerCase().includes("title"))).toBe(true);
    }
  });

  it("returns questions for partial summary with missing done_criteria", () => {
    const result = brainstorm({
      summary: {
        title: "X",
        goal: "Y",
        scope: { in: ["a"], out: [] },
      },
    });
    expect(result.phase).toBe("questions");
    if (result.phase === "questions") {
      expect(result.questions.some((q) => q.toLowerCase().includes("success criteria"))).toBe(true);
    }
  });

  it("does not include idea prefix when history exists", () => {
    const result = brainstorm({
      idea: "my idea",
      history: [{ question: "Q?", answer: "A" }],
    });
    expect(result.phase).toBe("questions");
    if (result.phase === "questions") {
      expect(result.questions[0]).not.toContain("my idea");
    }
  });
});
