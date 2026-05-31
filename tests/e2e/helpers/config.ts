import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_PATH = resolve(import.meta.dirname, "../e2e.config.json");

export interface E2eConfig {
  binaryPath: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  timeout: number;
}

export function readE2eConfig(): E2eConfig {
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  if (typeof parsed.apiKey !== "string" || !parsed.apiKey) {
    throw new Error("e2e.config.json: apiKey is required");
  }
  if (typeof parsed.model !== "string" || !parsed.model) {
    throw new Error("e2e.config.json: model is required");
  }

  return {
    binaryPath:
      typeof parsed.binaryPath === "string" ? parsed.binaryPath : "node dist/cli/index.js",
    provider: typeof parsed.provider === "string" ? parsed.provider : "deepseek",
    apiKey: parsed.apiKey,
    baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : undefined,
    model: parsed.model,
    timeout: typeof parsed.timeout === "number" ? parsed.timeout : 60_000,
  };
}

export function hasE2eConfig(): boolean {
  if (!existsSync(CONFIG_PATH)) return false;
  try {
    const config = readE2eConfig();
    return config.apiKey !== "your-api-key-here";
  } catch {
    return false;
  }
}

export function getBinaryCommand(): string[] {
  const config = readE2eConfig();
  return config.binaryPath.split(" ");
}
