import type {
    RecoveryAnalysisResult,
    RecoveryPolicyValidation,
    RecoverySimulationOutcome,
} from "@/types/recovery";

import type {
    DecisionSupportContext,
    VerifiedRecoveryPlan,
} from "./types";

function findPolicyValidation(planId: string, analysis: RecoveryAnalysisResult): RecoveryPolicyValidation {
    const validation = analysis.policyValidations.find((item) => item.planId === planId,);

    if (!validation) {
        throw new Error(`Missing policy validation for recovery plan ${planId}`);
    }

    return validation;
}

function findSimulationOutcome(planId: string, analysis: RecoveryAnalysisResult): RecoverySimulationOutcome {
    const outcome = analysis.simulation.outcomes.find((item) => item.planId === planId);

    if (!outcome) {
        throw new Error(`Missing simulation outcome for recovery plan ${planId}`);
    }

    return outcome;
}

export function buildDecisionSupportContext(analysis: RecoveryAnalysisResult): DecisionSupportContext {
    const plans: VerifiedRecoveryPlan[] = analysis.plans.map((plan) => ({
            plan,
            policyValidation: findPolicyValidation(plan.id, analysis),
            simulationOutcome: findSimulationOutcome(plan.id, analysis),
        }));

    return {
        incidentId: analysis.incidentId,
        incidentSeverity: analysis.incidentSeverity,
        plans,
    };
}