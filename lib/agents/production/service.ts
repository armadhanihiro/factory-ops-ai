import { getMaintenanceResult } from "@/lib/agents/maintenance/result-store";
import { getQualityResult } from "@/lib/agents/quality/result-store";
import type { FactoryState } from "@/types/factory";
import type { ProductionAssessment } from "@/types/production";

import { ProductionAgent } from "./agent";
import {
    getProductionResult,
    saveProductionResult,
} from "./result-store";

export async function getOrCreateProductionAssessment(incidentId: string, factoryState: FactoryState): Promise<ProductionAssessment> {
    const cached = getProductionResult(incidentId);

    if (cached) {
        return cached;
    }

    const qualityAssessment = getQualityResult(incidentId);

    if (!qualityAssessment) {
        throw new Error(`Quality assessment required before production assessment for incident ${incidentId}`);
    }

    const maintenanceAssessment = getMaintenanceResult(incidentId);

    if (!maintenanceAssessment) {
        throw new Error(`Maintenance assessment required before production assessment for incident ${incidentId}`);
    }

    const agent = new ProductionAgent();
    const result = await agent.assessProductionImpact(incidentId, factoryState, qualityAssessment, maintenanceAssessment);
    saveProductionResult(result);

    return result;
}