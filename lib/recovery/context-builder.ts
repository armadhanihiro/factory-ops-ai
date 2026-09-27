import type { FactoryState } from "@/types/factory";
import type { CrossFunctionalAnalysis } from "@/types/orchestrator";

import type { RecoverySimulationContext } from "./types";

export function buildRecoverySimulationContext(analysis: CrossFunctionalAnalysis, factoryState: FactoryState): RecoverySimulationContext {
    const incident = factoryState.incidents.find((item) => item.id === analysis.incidentId);

    if (!incident) {
        throw new Error(`Incident not found: ${analysis.incidentId}`);
    }

    if (incident.machineId !== analysis.machineId) {
        throw new Error("Recovery analysis machine does not match incident machine");
    }

    return {
        incident,
        factoryState,
        analysis,
    };
}