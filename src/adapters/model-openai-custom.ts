import { loadOpenaiCustomApiKey, loadOpenaiCustomBaseUrl } from "../config.js";
import { OpenAICompatClient } from "./model-openai-compat.js";

export interface OpenAICustomClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export class OpenAICustomClient extends OpenAICompatClient {
  constructor(opts: OpenAICustomClientOptions = {}) {
    const apiKey = opts.apiKey ?? loadOpenaiCustomApiKey();
    const baseUrl = opts.baseUrl ?? loadOpenaiCustomBaseUrl();
    if (!apiKey) {
      throw new Error(
        "OpenAI-custom API key is not set. Set OPENAI_API_KEY or add openai.apiKey to config.json.",
      );
    }
    if (!baseUrl) {
      throw new Error(
        "OpenAI-custom base URL is not set. Set OPENAI_BASE_URL or add openai.baseUrl to config.json.",
      );
    }
    super({
      apiKey,
      baseUrl,
      timeoutMs: opts.timeoutMs ?? 660_000,
      fetch: opts.fetch,
    });
  }

  override providerLabel(): string {
    return "OpenAI-Custom";
  }
}
