/** API key validation — extracted from Wizard, now standalone. */

import { describe, expect, it } from "vitest";
import { validateDeepSeekApiKey } from "../src/cli/validate-api-key.js";

describe("validateDeepSeekApiKey", () => {
  it("accepts a key when auth check succeeds", async () => {
    const fetcher = async () => new Response(JSON.stringify({ data: [] }), { status: 200 });

    await expect(
      validateDeepSeekApiKey("sk-valid1234567890", { fetch: fetcher as typeof fetch }),
    ).resolves.toEqual({ ok: true });
  });

  it("rejects a key when the endpoint returns 401", async () => {
    const fetcher = async () => new Response("unauthorized", { status: 401 });

    await expect(
      validateDeepSeekApiKey("sk-invalid12345678", { fetch: fetcher as typeof fetch }),
    ).resolves.toEqual({ ok: false, reason: "rejected" });
  });

  it("returns failed when validation cannot complete", async () => {
    const fetcher = async () => new Response("maintenance", { status: 503 });

    await expect(
      validateDeepSeekApiKey("sk-valid1234567890", { fetch: fetcher as typeof fetch }),
    ).resolves.toMatchObject({ ok: false, reason: "failed", message: "HTTP 503" });
  });

  it("hits /models, not /user/balance — third-party endpoints accept it", async () => {
    const calls: string[] = [];
    const fetcher = async (url: string) => {
      calls.push(url);
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    };

    await expect(
      validateDeepSeekApiKey("sk-valid1234567890", {
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        fetch: fetcher as typeof fetch,
      }),
    ).resolves.toEqual({ ok: true });

    expect(calls).toEqual(["https://dashscope.aliyuncs.com/compatible-mode/v1/models"]);
  });
});
