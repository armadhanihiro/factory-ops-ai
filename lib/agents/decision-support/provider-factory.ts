import type { DecisionSupportProvider } from "./provider";

import { GeminiDecisionSupportProvider } from "./gemini-provider";

export function createDecisionSupportProvider():
    DecisionSupportProvider {
        const provider = process.env.DECISION_SUPPORT_PROVIDER ?? "gemini";

        switch (provider) {
            case "gemini":
                return new GeminiDecisionSupportProvider();

            default:
                throw new Error(`Unsupported decision support provider: ${provider}`);
        }
    }