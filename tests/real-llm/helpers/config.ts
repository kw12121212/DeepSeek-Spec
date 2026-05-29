import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GLMClient } from "../../../src/adapters/model-glm.js";

const CONFIG_PATH = resolve(import.meta.dirname, "../../real-llm.config.json");

export interface RealLlmConfig {
  zhipuApiKey: string;
  model: string;
  baseUrl?: string;
}

const API_KEY_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function readRealLlmConfig(): RealLlmConfig {
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  if (typeof parsed.zhipuApiKey !== "string" || !parsed.zhipuApiKey) {
    throw new Error("real-llm.config.json: zhipuApiKey is required");
  }
  if (!API_KEY_RE.test(parsed.zhipuApiKey)) {
    throw new Error("real-llm.config.json: zhipuApiKey must match id.secret pattern");
  }
  if (typeof parsed.model !== "string" || !parsed.model) {
    throw new Error("real-llm.config.json: model is required");
  }

  return {
    zhipuApiKey: parsed.zhipuApiKey,
    model: parsed.model,
    baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : undefined,
  };
}

export function hasRealLlmConfig(): boolean {
  if (!existsSync(CONFIG_PATH)) return false;
  try {
    readRealLlmConfig();
    return true;
  } catch {
    return false;
  }
}

export function createRealLlmClient(): GLMClient {
  const config = readRealLlmConfig();
  return new GLMClient({
    apiKey: config.zhipuApiKey,
    baseUrl: config.baseUrl,
  });
}
