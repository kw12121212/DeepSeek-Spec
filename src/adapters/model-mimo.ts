import { loadMimoApiKey, loadMimoBaseUrl } from "../config.js";
import { OpenAICompatClient } from "./model-openai-compat.js";

export interface MimoClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export class MimoClient extends OpenAICompatClient {
  constructor(opts: MimoClientOptions = {}) {
    const apiKey = opts.apiKey ?? loadMimoApiKey();
    if (!apiKey) {
      throw new Error(
        "MiMo API key is not set. Set MIMO_API_KEY or add mimo.apiKey to config.json.",
      );
    }
    super({
      apiKey,
      baseUrl: opts.baseUrl ?? loadMimoBaseUrl() ?? "https://token-plan-cn.xiaomimimo.com/v1",
      timeoutMs: opts.timeoutMs ?? 660_000,
      fetch: opts.fetch,
    });
  }

  override authHeaders(): Record<string, string> {
    return { "api-key": this.apiKey };
  }

  override providerLabel(): string {
    return "MiMo";
  }
}
