import { DiagnosticAgent } from "@/lib/agents/diagnostic/agent";
import {
    getDiagnosticResult,
    saveDiagnosticResult,
} from "@/lib/agents/diagnostic/result-store";

import { QualityAgent } from "@/lib/agents/quality/agent";
import {
    getQualityResult,
    saveQualityResult,
} from "@/lib/agents/quality/result-store";
import { getOrCreateMaintenanceAssessment } from "@/lib/agents/maintenance/service";
import { getOrCreateProductionAssessment } from "@/lib/agents/production/service";

import type { FactoryState } from "@/types/factory";
import type {
    CrossFunctionalAnalysis,
    OrchestrationResult,
} from "@/types/orchestrator";

export class IncidentOrchestrator {
    async investigate(incidentId: string, factoryState: FactoryState): Promise<OrchestrationResult> {
        const incident = factoryState.incidents.find((item) => item.id === incidentId);

        if (!incident) {
            throw new Error(`Incident not found: ${incidentId}`);
        }

        /*
        * Diagnostic and Quality are independent.
        * Use cached results when available.
        * Otherwise run both specialists concurrently.
        */
        const diagnosticPromise = (async () => {
            const cached = getDiagnosticResult(incidentId);

            if (cached) {
                return cached;
            }

            const agent = new DiagnosticAgent();
            const result = await agent.investigate(incident, factoryState);
            saveDiagnosticResult(result);

            return result;
        })();

        const qualityPromise = (async () => {
            const cached = getQualityResult(incidentId);

            if (cached) {
                return cached;
            }

            const agent = new QualityAgent();
            const result = await agent.assessImpact(incident, factoryState);
            saveQualityResult(result);

            return result;
        })();

        const [diagnosis, quality] = await Promise.all([
            diagnosticPromise,
            qualityPromise,
        ]);

        /*
        * Maintenance depends on the cached
        * Diagnostic result.
        */
        const maintenance = await getOrCreateMaintenanceAssessment(incident, factoryState);

        /*
        * Production depends on cached
        * Quality + Maintenance results.
        */
        const production = await getOrCreateProductionAssessment(incidentId, factoryState);

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
}