import { GLMClient } from "../adapters/model-glm.js";
import { DeepSeekClient } from "../client.js";
import { loadActiveProvider, loadEndpoint, modelToProvider } from "../config.js";
import type { ModelClient } from "../ports/model-client.js";

export type ModelClientFactory = () => ModelClient;

interface ProviderEntry {
  factory: ModelClientFactory;
  supportedModels: readonly string[];
}

export class ProviderRegistry {
  private entries = new Map<string, ProviderEntry>();
  private cache = new Map<string, ModelClient>();

  register(id: string, factory: ModelClientFactory, supportedModels: readonly string[]): void {
    this.entries.set(id, { factory, supportedModels });
  }

  resolve(providerId: string): ModelClient {
    let cached = this.cache.get(providerId);
    if (cached) return cached;
    const entry = this.entries.get(providerId);
    if (!entry) throw new Error(`Provider '${providerId}' is not registered`);
    cached = entry.factory();
    this.cache.set(providerId, cached);
    return cached;
  }

  validateModel(providerId: string, modelId: string): void {
    const entry = this.entries.get(providerId);
    if (!entry) throw new Error(`Provider '${providerId}' is not registered`);
    if (!entry.supportedModels.includes(modelId)) {
      throw new Error(
        `Model '${modelId}' is not supported by provider '${providerId}'. Supported: ${entry.supportedModels.join(", ")}`,
      );
    }
  }

  supportedModels(providerId: string): readonly string[] {
    return this.entries.get(providerId)?.supportedModels ?? [];
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }
}

export function createClientForProvider(modelId?: string): ModelClient {
  const provider = modelId ? modelToProvider(modelId) : loadActiveProvider();
  if (provider === "glm") return new GLMClient();
  const ep = loadEndpoint();
  return new DeepSeekClient({ apiKey: ep.apiKey, baseUrl: ep.baseUrl });
}
