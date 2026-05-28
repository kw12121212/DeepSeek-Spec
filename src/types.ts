export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  description?: string;
  enum?: unknown[];
  [k: string]: unknown;
}

export interface ToolFunctionSpec {
  name: string;
  description: string;
  parameters: JSONSchema;
}

export interface ToolSpec {
  type: "function";
  function: ToolFunctionSpec;
}

export interface ToolCall {
  id?: string;
  type?: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export type Role = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: Role;
  content?: string | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  /** Must round-trip in tool-loop continuations — thinking mode 400s without it. */
  reasoning_content?: string | null;
}

export interface RawUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
  /** Ollama native API: input tokens processed. */
  prompt_eval_count?: number;
  /** Ollama native API: output tokens generated. */
  eval_count?: number;
}

export interface ChatRequestOptions {
  model: string;
  messages: ChatMessage[];
  tools?: ToolSpec[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
  /** DeepSeek response_format — use { type: "json_object" } to force valid JSON. */
  responseFormat?: { type: "json_object" | "text" };
  thinking?: "enabled" | "disabled";
  reasoningEffort?: import("./config.js").ReasoningEffort;
}

export class Usage {
  constructor(
    public promptTokens = 0,
    public completionTokens = 0,
    public totalTokens = 0,
    public promptCacheHitTokens = 0,
    public promptCacheMissTokens = 0,
  ) {}

  get cacheHitRatio(): number {
    const denom = this.promptCacheHitTokens + this.promptCacheMissTokens;
    return denom > 0 ? this.promptCacheHitTokens / denom : 0;
  }

  static hasApiUsage(raw: unknown): raw is RawUsage {
    if (!raw || typeof raw !== "object") return false;
    const u = raw as RawUsage;
    return (
      typeof u.prompt_tokens === "number" ||
      typeof u.completion_tokens === "number" ||
      typeof u.total_tokens === "number" ||
      typeof u.prompt_cache_hit_tokens === "number" ||
      typeof u.prompt_cache_miss_tokens === "number" ||
      typeof u.prompt_eval_count === "number" ||
      typeof u.eval_count === "number"
    );
  }

  static fromApi(raw: RawUsage | undefined | null): Usage {
    const u = raw ?? {};
    const promptTokens = u.prompt_tokens ?? u.prompt_eval_count ?? 0;
    const completionTokens = u.completion_tokens ?? u.eval_count ?? 0;
    const cacheHitTokens = u.prompt_cache_hit_tokens ?? 0;
    const cacheMissTokens =
      u.prompt_cache_miss_tokens ?? Math.max(0, promptTokens - cacheHitTokens);
    return new Usage(
      promptTokens,
      completionTokens,
      u.total_tokens ?? promptTokens + completionTokens,
      cacheHitTokens,
      cacheMissTokens,
    );
  }
}

export interface ChatResponse {
  content: string;
  reasoningContent: string | null;
  toolCalls: ToolCall[];
  usage: Usage;
  raw: unknown;
}

export interface StreamChunk {
  contentDelta?: string;
  reasoningDelta?: string;
  toolCallDelta?: { index: number; id?: string; name?: string; argumentsDelta?: string };
  usage?: Usage;
  finishReason?: string;
  raw: any;
}
