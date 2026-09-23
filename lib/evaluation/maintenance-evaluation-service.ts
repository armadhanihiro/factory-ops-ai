import { getDiagnosticResult } from "@/lib/agents/diagnostic/result-store";
import { getMaintenanceResult } from "@/lib/agents/maintenance/result-store";
import type { FactoryState } from "@/types/factory";

import { evaluateMaintenanceAssessment } from "./maintenance-evaluator";

export function evaluateCachedMaintenanceAssessment(incidentId: string, factoryState: FactoryState,) {
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
    }

    const diagnosis = getDiagnosticResult(incidentId);

    if (!diagnosis) {
        throw new Error(`Cached diagnostic result required for maintenance evaluation: ${incidentId}`);
    }

    const maintenance = getMaintenanceResult(incidentId);

    if (!maintenance) {
        throw new Error(`Cached maintenance assessment required for evaluation: ${incidentId}`);
    }

    return evaluateMaintenanceAssessment(maintenance, incident, diagnosis);
}