import { getMaintenanceResult } from "@/lib/agents/maintenance/result-store";
import { buildProductionContext } from "@/lib/agents/production/context";
import { buildProductionFacts } from "@/lib/agents/production/production-facts";
import { getProductionResult } from "@/lib/agents/production/result-store";
import { getQualityResult } from "@/lib/agents/quality/result-store";
import type { FactoryState } from "@/types/factory";
import type { ProductionEvaluation } from "@/types/evaluation";

import { evaluateProductionAssessment } from "./production-evaluator";

export function evaluateCachedProductionAssessment(incidentId: string, factoryState: FactoryState): ProductionEvaluation {
    const productionAssessment = getProductionResult(incidentId);

    if (!productionAssessment) {
        throw new Error(`Production assessment required before evaluation for incident ${incidentId}`);
    }

    const qualityAssessment = getQualityResult(incidentId);

    if (!qualityAssessment) {
        throw new Error(`Quality assessment required before production evaluation for incident ${incidentId}`);
    }

    const maintenanceAssessment = getMaintenanceResult(incidentId);

    if (!maintenanceAssessment) {
        throw new Error(`Maintenance assessment required before production evaluation for incident ${incidentId}`);
    }

    const context = buildProductionContext(incidentId, factoryState, qualityAssessment, maintenanceAssessment);
    const facts = buildProductionFacts(context);

    return evaluateProductionAssessment(productionAssessment, facts);
}