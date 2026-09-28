import type { RecoveryAnalysisResult } from "@/types/recovery";

export interface ApprovalEligibility {
    eligible: boolean;
    blockingReasons: string[];
}

export function checkApprovalEligibility(planId: string, analysis: RecoveryAnalysisResult): ApprovalEligibility {
    const plan = analysis.plans.find((item) => item.id === planId,);

    if (!plan) {
        return {
            eligible: false,
            blockingReasons: [
                `Recovery plan ${planId} does not exist`,
            ],
        };
    }

    const policy = analysis.policyValidations.find((item) => item.planId === planId);
    const simulation = analysis.simulation.outcomes.find((item) => item.planId === planId);
    const blockingReasons: string[] = [];

    if (!policy) {
        blockingReasons.push("Recovery plan has no policy validation");
    } else if (!policy.compliant) {
        blockingReasons.push(...policy.violations.map((violation) => `Policy conflict: ${violation}`));
    }

    if (!simulation) {
        blockingReasons.push("Recovery plan has no simulation outcome");
    } else if (!simulation.feasible) {
        blockingReasons.push(...simulation.constraintViolations.map((violation) => `Simulation constraint: ${violation}`));

        if (simulation.constraintViolations.length === 0) {
            blockingReasons.push("Recovery plan is not structurally feasible");
        }
    }

    return {
        eligible: blockingReasons.length === 0,
        blockingReasons,
    };
}