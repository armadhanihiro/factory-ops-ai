import type { FactoryState } from "@/types/factory";
import type { RecoverySimulationResult } from "@/types/recovery";

import { getOrCreateOrchestration } from "@/lib/orchestrator/service";

import { buildRecoverySimulationContext } from "./context-builder";
import { buildReferenceRecoveryPlans } from "./reference-plans";
import { RecoverySimulator } from "./simulator";

export async function simulateIncidentRecovery(incidentId: string, factoryState: FactoryState): Promise<RecoverySimulationResult> {
    const orchestration = await getOrCreateOrchestration(incidentId, factoryState);
    const analysis = orchestration.analysis;
    const orderId = analysis.production.affectedOrderId;

    if (!orderId) {
        throw new Error(`No affected production order found for incident ${incidentId}`);
    }

    const alternative = analysis.production.alternatives.find((candidate) => candidate.available);

    if (!alternative) {
        throw new Error(`No available recovery alternative found for incident ${incidentId}`);
    }

    const plans = buildReferenceRecoveryPlans(incidentId, analysis.machineId, orderId, alternative.machineId);
    const context = buildRecoverySimulationContext(analysis, factoryState);
    const simulator = new RecoverySimulator();

    return simulator.simulate(plans, context);
}