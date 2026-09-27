import type { FactoryState } from "@/types/factory";
import type { RecoverySimulationResult } from "@/types/recovery";

import { getOrCreateOrchestration } from "@/lib/orchestrator/service";
import { getOrCreateRecoveryPlans } from "@/lib/agents/recovery-planner/service";

import { buildRecoverySimulationContext } from "./context-builder";
import { RecoverySimulator } from "./simulator";

export async function simulateIncidentRecovery(incidentId: string, factoryState: FactoryState): Promise<RecoverySimulationResult> {
    const orchestration = await getOrCreateOrchestration(incidentId, factoryState);
    const plannerResult = await getOrCreateRecoveryPlans(incidentId, factoryState);
    const context = buildRecoverySimulationContext(orchestration.analysis, factoryState);

    return new RecoverySimulator().simulate(plannerResult.plans, context);
}