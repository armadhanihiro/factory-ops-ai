import type { RecoveryPlannerResult } from "@/types/recovery-planner";

import { createRecoveryPlannerProvider } from "./provider-factory";
import type { RecoveryPlannerContext } from "./types";

export class RecoveryPlannerAgent {
    async plan(context: RecoveryPlannerContext): Promise<RecoveryPlannerResult> {
        const provider = createRecoveryPlannerProvider();
        const plans = await provider.generatePlans(context);

        return {
            incidentId: context.incidentId,
            plans,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}