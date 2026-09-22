import type { MaintenanceAssessment } from "@/types/maintenance";
import type {
    FactoryState,
    Incident,
} from "@/types/factory";

import { getDiagnosticResult } from "@/lib/agents/diagnostic/result-store";

import { MaintenanceAgent } from "./agent";
import {
    getMaintenanceResult,
    saveMaintenanceResult,
} from "./result-store";

export async function getOrCreateMaintenanceAssessment(incident: Incident, factoryState: FactoryState): Promise<MaintenanceAssessment> {
    const cached = getMaintenanceResult(incident.id);

    if (cached) {
        return cached;
    }

    const diagnosis = getDiagnosticResult(incident.id);

    if (!diagnosis) {
        throw new Error(`Diagnostic result required before maintenance assessment for incident ${incident.id}`);
    }

    const agent = new MaintenanceAgent();
    const assessment = await agent.assessMaintenanceNeeds(incident, factoryState, diagnosis);

    return saveMaintenanceResult(assessment);
}