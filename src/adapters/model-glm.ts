import { loadGlmApiKey, loadGlmBaseUrl } from "../config.js";
import { OpenAICompatClient } from "./model-openai-compat.js";

export interface GLMClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export class GLMClient extends OpenAICompatClient {
  constructor(opts: GLMClientOptions = {}) {
    const apiKey = opts.apiKey ?? loadGlmApiKey();
    if (!apiKey) {
      throw new Error(
        "Zhipu API key is not set. Set ZHIPU_API_KEY or add glm.apiKey to config.json.",
      );
    }
    super({
      apiKey,
      baseUrl: opts.baseUrl ?? loadGlmBaseUrl() ?? "https://open.bigmodel.cn/api/coding/paas/v4",
      timeoutMs: opts.timeoutMs ?? 660_000,
      fetch: opts.fetch,
    });
  }

  override providerLabel(): string {
    return "GLM";
  }
}
