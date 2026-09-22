import type { QualityProvider } from "./types";

import { GeminiQualityProvider } from "./gemini-provider";
import { MockQualityProvider } from "./mock-provider";

export function createQualityProvider(): QualityProvider {
    const provider = process.env.QUALITY_PROVIDER ?? "mock";

    switch (provider) {
        case "mock":
            return new MockQualityProvider();

        case "gemini":
            return new GeminiQualityProvider();

        default:
            throw new Error(`Unsupported quality provider: ${provider}`);
    }
}