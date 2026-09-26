import { GeminiProductionProvider } from "./gemini-provider";
import { MockProductionProvider } from "./mock-provider";
import type { ProductionProvider } from "./types";

export function createProductionProvider(): ProductionProvider {
  const provider = process.env.PRODUCTION_PROVIDER?.toLowerCase() ?? "mock";

  switch (provider) {
        case "gemini":
            return new GeminiProductionProvider();

        case "mock":
            return new MockProductionProvider();

        default:
            throw new Error(`Unsupported PRODUCTION_PROVIDER: ${provider}`);
  }
}