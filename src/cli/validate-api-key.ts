import { loadBaseUrl, loadGlmBaseUrl } from "../config.js";

export type ApiKeyValidationResult =
  | { ok: true }
  | { ok: false; reason: "rejected" | "failed"; message?: string };

// Hit `/models` instead of DeepSeek's `/user/balance`: the OpenAI-compat
// listing endpoint exists on every provider that pretends to be OpenAI
// (DeepSeek, DashScope/Tongyi, Moonshot, Zhipu, …), and 401/403 there
// still means "key bad" the same way.
export async function validateDeepSeekApiKey(
  apiKey: string,
  opts: {
    baseUrl?: string;
    timeoutMs?: number;
    fetch?: typeof fetch;
  } = {},
): Promise<ApiKeyValidationResult> {
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
  let baseUrl = opts.baseUrl ?? loadBaseUrl() ?? "https://api.deepseek.com";
  while (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10_000);
  try {
    const resp = await fetchImpl(`${baseUrl}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
    });
    if (resp.ok) return { ok: true };
    if (resp.status === 401 || resp.status === 403) return { ok: false, reason: "rejected" };
    return { ok: false, reason: "failed", message: `HTTP ${resp.status}` };
  } catch (e) {
    return { ok: false, reason: "failed", message: (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export async function validateGlmApiKey(
  apiKey: string,
  opts: {
    baseUrl?: string;
    timeoutMs?: number;
    fetch?: typeof fetch;
  } = {},
): Promise<ApiKeyValidationResult> {
  const fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
  let baseUrl = opts.baseUrl ?? loadGlmBaseUrl() ?? "https://open.bigmodel.cn/api/paas/v4";
  while (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10_000);
  try {
    const resp = await fetchImpl(`${baseUrl}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
    });
    if (resp.ok) return { ok: true };
    if (resp.status === 401 || resp.status === 403) return { ok: false, reason: "rejected" };
    return { ok: false, reason: "failed", message: `HTTP ${resp.status}` };
  } catch (e) {
    return { ok: false, reason: "failed", message: (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}
