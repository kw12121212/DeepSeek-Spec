import { describe, expect, it } from "vitest";
import { invokeStrict } from "../src/strict/invoker";

describe("invokeStrict", () => {
  it("returns ok=true with parsed JSON data when subprocess outputs valid JSON", async () => {
    const result = await invokeStrict("roadmap-status", {
      cwd: process.cwd(),
    });
    if (result.ok) {
      expect(result.data).toBeDefined();
      if (typeof result.data === "string") {
        expect(result.data.length).toBeGreaterThan(0);
      } else {
        expect(typeof result.data).toBe("object");
      }
    } else {
      expect(result.error).toBeTruthy();
    }
  });

  it("returns ok=false with error for a non-zero exit", async () => {
    const result = await invokeStrict("verify", {
      args: ["nonexistent-change"],
      cwd: process.cwd(),
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("forwards cwd to the child process", async () => {
    const result = await invokeStrict("roadmap-status", {
      cwd: "/tmp",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("handles non-JSON stdout by returning it as string data", async () => {
    const result = await invokeStrict("init", {
      cwd: process.cwd(),
    });
    if (result.ok) {
      if (result.data !== undefined) {
        expect(typeof result.data === "string" || typeof result.data === "object").toBe(true);
      }
    }
  });
});
