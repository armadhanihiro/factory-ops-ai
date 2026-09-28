import type { FactoryState } from "@/types/factory";
import type { RecoveryAnalysisResult } from "@/types/recovery";

import { getOrCreateRecoveryPlans } from "@/lib/agents/recovery-planner/service";
import { getOrCreateOrchestration } from "@/lib/orchestrator/service";

import { buildRecoverySimulationContext } from "./context-builder";
import { RecoveryPolicyValidator } from "./policy-validator";
import { RecoverySimulator } from "./simulator";

export async function analyzeIncidentRecovery(incidentId: string, factoryState: FactoryState): Promise<RecoveryAnalysisResult> {
    const orchestration = await getOrCreateOrchestration(incidentId, factoryState);
    const plannerResult = await getOrCreateRecoveryPlans(incidentId, factoryState);
    const analysis = orchestration.analysis;
    const policyValidator = new RecoveryPolicyValidator();
    const policyValidations = policyValidator.validateAll(plannerResult.plans, analysis);
    const simulationContext = buildRecoverySimulationContext(analysis, factoryState);
    const simulation = new RecoverySimulator().simulate(plannerResult.plans, simulationContext);

    return {
        incidentId,
        incidentSeverity: analysis.incidentSeverity,
        plans: plannerResult.plans,
        policyValidations,
        simulation,
        analyzedAt: new Date().toISOString(),
    };
}