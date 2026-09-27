import type { RecoveryPlannerProvider } from "./provider";

import { GeminiRecoveryPlannerProvider } from "./gemini-provider";

export function createRecoveryPlannerProvider(): RecoveryPlannerProvider {
    const provider = process.env.RECOVERY_PLANNER_PROVIDER ?? "gemini";

    switch (provider) {
        case "gemini":
            return new GeminiRecoveryPlannerProvider();

        default:
            throw new Error(`Unsupported recovery planner provider: ${provider}`);
    }
}