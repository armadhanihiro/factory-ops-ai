import type { FactoryState } from "@/types/factory";
import type { RecoveryPlannerResult } from "@/types/recovery-planner";

import { getOrCreateOrchestration } from "@/lib/orchestrator/service";

import { RecoveryPlannerAgent } from "./agent";
import { buildRecoveryPlannerContext } from "./context";
import {
    getRecoveryPlannerResult,
    saveRecoveryPlannerResult,
} from "./result-store";

export async function getOrCreateRecoveryPlans(incidentId: string, factoryState: FactoryState): Promise<RecoveryPlannerResult> {
    const cached = getRecoveryPlannerResult(incidentId);

    if (cached) {
        return cached;
    }

    const orchestration = await getOrCreateOrchestration(incidentId, factoryState);
    const context = buildRecoveryPlannerContext(orchestration.analysis);
    const agent = new RecoveryPlannerAgent();
    const result = await agent.plan(context);

    saveRecoveryPlannerResult(result);

    return result;
}