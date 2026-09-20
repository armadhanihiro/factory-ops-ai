import type { DiagnosticProvider } from "./types";

import { MockDiagnosticProvider } from "./mock-provider";
import { GeminiDiagnosticProvider } from "./gemini-provider";

export function createDiagnosticProvider(): DiagnosticProvider {
    const provider = process.env.DIAGNOSTIC_PROVIDER ?? "mock";

    switch (provider) {
        case "mock":
            return new MockDiagnosticProvider();

        case "gemini":
            return new GeminiDiagnosticProvider();

        default:
            throw new Error(`Unsupported diagnostic provider: ${provider}`);
    }
}