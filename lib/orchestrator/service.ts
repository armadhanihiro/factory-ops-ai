import type { FactoryState } from "@/types/factory";
import type {
    CrossFunctionalAnalysis,
    OrchestrationResult,
} from "@/types/orchestrator";

import { DiagnosticAgent } from "@/lib/agents/diagnostic/agent";
import { QualityAgent } from "@/lib/agents/quality/agent";
import { MaintenanceAgent } from "@/lib/agents/maintenance/agent";
import { ProductionAgent } from "@/lib/agents/production/agent";

import { IncidentOrchestrator } from "./incident-orchestrator";
import {
    getOrchestrationResult,
    saveOrchestrationResult,
} from "./result-store";

export async function createFreshOrchestration(incidentId: string, factoryState: FactoryState): Promise<OrchestrationResult> {
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
    }

    /*
     * Execution-time safety path.
     *
     * Do not read or overwrite specialist caches.
     * Every assessment is rebuilt from the supplied
     * current factory state.
     */
    const diagnosticAgent = new DiagnosticAgent();
    const qualityAgent = new QualityAgent();

    const [diagnosis, quality] = await Promise.all([
        diagnosticAgent.investigate(incident, factoryState,),
        qualityAgent.assessImpact(incident, factoryState),
    ]);

    /*
     * Maintenance must use the fresh diagnosis,
     * not the cached diagnostic result.
     */
    const maintenanceAgent = new MaintenanceAgent();
    const maintenance = await maintenanceAgent.assessMaintenanceNeeds(incident, factoryState, diagnosis);

    /*
     * Production must use the fresh quality and
     * maintenance assessments.
     */
    const productionAgent = new ProductionAgent();
    const production = await productionAgent.assessProductionImpact(incidentId, factoryState, quality, maintenance);

    const analysis: CrossFunctionalAnalysis = {
        incidentId,
        machineId: incident.machineId,
        incidentSeverity: incident.severity,
        diagnosis,
        quality,
        maintenance,
        production,
        generatedAt: new Date().toISOString(),
    };

    return {
        incidentId,
        status: "COMPLETED",
        analysis,
        completedAt: new Date().toISOString(),
    };
}

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