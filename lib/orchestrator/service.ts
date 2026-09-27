import type { FactoryState } from "@/types/factory";
import type { OrchestrationResult } from "@/types/orchestrator";

import { IncidentOrchestrator } from "./incident-orchestrator";
import {
    getOrchestrationResult,
    saveOrchestrationResult,
} from "./result-store";

export async function getOrCreateOrchestration(incidentId: string, factoryState: FactoryState): Promise<OrchestrationResult> {
    const cached = getOrchestrationResult(incidentId);

    if (cached) {
        return cached;
    }

    const orchestrator = new IncidentOrchestrator();
    const result = await orchestrator.investigate(incidentId, factoryState);
    saveOrchestrationResult(result);

    return result;
}