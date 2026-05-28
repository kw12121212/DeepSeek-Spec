import type { ChatRequestOptions, ChatResponse, StreamChunk } from "../types.js";

export interface ProviderCapabilities {
  supportsThinking: boolean;
  supportsReasoningContent: boolean;
}

export interface ModelClient {
  chat(opts: ChatRequestOptions): Promise<ChatResponse>;
  stream(opts: ChatRequestOptions): AsyncGenerator<StreamChunk>;
  readonly capabilities: ProviderCapabilities;
}

export type { ChatResponse, StreamChunk };
