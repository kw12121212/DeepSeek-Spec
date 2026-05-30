import { describe, expect, it } from "vitest";
import { createRealLlmClient, readRealLlmConfig } from "./helpers/config.js";

const config = readRealLlmConfig();

describe("GLM real-LLM tool calls", () => {
  it("invokes a tool when prompted", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const res = await client.chat({
      model: config.model,
      messages: [{ role: "user", content: "What is the weather in Beijing?" }],
      tools: [
        {
          type: "function",
          function: {
            name: "get_weather",
            description: "Get weather for a city",
            parameters: {
              type: "object",
              properties: { city: { type: "string" } },
              required: ["city"],
            },
          },
        },
      ],
    });

    expect(Array.isArray(res.toolCalls)).toBe(true);
    expect(res.toolCalls.length).toBeGreaterThan(0);
    expect(res.toolCalls[0].function.name).toBe("get_weather");

    const args = JSON.parse(res.toolCalls[0].function.arguments) as Record<string, unknown>;
    expect(args).toHaveProperty("city");
    const city = String(args.city).toLowerCase();
    expect(city.includes("beijing") || city.includes("北京")).toBe(true);
  });
});
