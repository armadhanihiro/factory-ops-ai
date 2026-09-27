import type { CrossFunctionalAnalysis } from "@/types/orchestrator";

import type { RecoveryPlannerContext } from "./types";

export function buildRecoveryPlannerContext(analysis: CrossFunctionalAnalysis): RecoveryPlannerContext {
    const affectedOrderId = analysis.production.affectedOrderId;

    if (!affectedOrderId) {
        throw new Error(`Incident ${analysis.incidentId} has no affected production order`);
    }

    return {
        incidentId: analysis.incidentId,
        machineId: analysis.machineId,
        affectedOrderId,
        analysis,
    };
}