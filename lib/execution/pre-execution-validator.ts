import type { RecoveryApproval } from "@/types/approval";
import type { FactoryState } from "@/types/factory";
import type { RecoveryPlan } from "@/types/recovery";

import { createFreshOrchestration } from "@/lib/orchestrator/service";
import { buildRecoverySimulationContext } from "@/lib/recovery/context-builder";
import { RecoveryPolicyValidator } from "@/lib/recovery/policy-validator";
import { RecoverySimulator } from "@/lib/recovery/simulator";

export interface PreExecutionValidation {
    valid: boolean;
    blockingReasons: string[];
}

export async function validateBeforeExecution(approval: RecoveryApproval, plan: RecoveryPlan, currentState: FactoryState): Promise<PreExecutionValidation> {
    const blockingReasons: string[] = [];

    /*
     * Approval boundary.
     */
    if (approval.status !== "APPROVED") {
        blockingReasons.push(`Approval ${approval.id} is not APPROVED`);
    }

    if (approval.planId !== plan.id) {
        blockingReasons.push("Approved plan does not match execution plan");
    }

    if (approval.incidentId !== plan.incidentId) {
        blockingReasons.push("Approval incident does not match recovery plan");
    }

    /*
     * Do not continue into operational validation when
     * the approval itself does not match the requested plan.
     */
    if (blockingReasons.length > 0) {
        return {
            valid: false,
            blockingReasons,
        };
    }

    const incident = currentState.incidents.find((item) => item.id === approval.incidentId);

    if (!incident) {
        return {
            valid: false,
            blockingReasons: [`Incident ${approval.incidentId} no longer exists`],
        };
    }

    /*
     * Refresh cross-functional operational evidence.
     *
     * The approved recovery plan remains unchanged.
     * Gemini does not generate a new recovery plan here.
     */
    const orchestration = await createFreshOrchestration(approval.incidentId, currentState);
    const analysis = orchestration.analysis;

    /*
     * Re-run deterministic policy validation against
     * the current operational analysis.
     */
    const policyValidation = new RecoveryPolicyValidator().validate( plan, analysis);

    if (!policyValidation.compliant) {
        blockingReasons.push(...policyValidation.violations.map((violation) => `Current policy conflict: ${violation}`));
    }

    /*
     * Re-run deterministic recovery simulation against
     * the current factory state.
     */
    const simulationContext = buildRecoverySimulationContext(analysis, currentState);
    const simulation = new RecoverySimulator().simulate([plan], simulationContext);
    const outcome = simulation.outcomes.find((item) => item.planId === plan.id);

    if (!outcome) {
        blockingReasons.push("No current simulation outcome exists for approved plan");
    } else if (!outcome.feasible) {
        blockingReasons.push(...outcome.constraintViolations.map((violation) => `Current-state constraint: ${violation}`));
    }

    return {
        valid: blockingReasons.length === 0,
        blockingReasons,
    };
}