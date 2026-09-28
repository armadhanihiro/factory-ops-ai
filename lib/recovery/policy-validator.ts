import type { CrossFunctionalAnalysis } from "@/types/orchestrator";
import type {
    RecoveryPlan,
    RecoveryPolicyValidation,
} from "@/types/recovery";

function hasAction(plan: RecoveryPlan, type: RecoveryPlan["actions"][number]["type"]): boolean {
    return plan.actions.some((action) => action.type === type);
}

export class RecoveryPolicyValidator {
    validate(plan: RecoveryPlan, analysis: CrossFunctionalAnalysis): RecoveryPolicyValidation {
        const violations: string[] = [];
        const continuesProduction = hasAction(plan, "CONTINUE_PRODUCTION");
        const pausesMachine = hasAction(plan, "PAUSE_MACHINE");
        const inspectsMachine = hasAction(plan, "INSPECT_MACHINE");
        const holdsOutput = hasAction(plan, "HOLD_OUTPUT");

        /*
         * Maintenance policy
         *
         * An urgent recommendation for immediate inspection
         * means a recovery strategy should not explicitly
         * continue production on the affected machine.
         */
        if (analysis.maintenance.urgency === "URGENT" && analysis.maintenance.operationalRecommendation === "IMMEDIATE_INSPECTION_RECOMMENDED") {
            if (continuesProduction) {
                violations.push("CONTINUE_PRODUCTION conflicts with IMMEDIATE_INSPECTION_RECOMMENDED");
            }

            if (!inspectsMachine) {
                violations.push("INSPECT_MACHINE is required by IMMEDIATE_INSPECTION_RECOMMENDED");
            }
        }

        /*
         * Quality policy
         *
         * If Quality explicitly recommends holding or
         * quarantining output, the recovery strategy must
         * contain an output hold.
         */
        if (analysis.quality.dispositionRecommendation === "HOLD_FOR_INSPECTION" || analysis.quality.dispositionRecommendation === "QUARANTINE_RECOMMENDED") {
            if (!holdsOutput) {
                violations.push(`HOLD_OUTPUT is required by ${analysis.quality.dispositionRecommendation}`);
            }
        }

        /*
         * If production is explicitly paused, an urgent
         * inspection recommendation should actually include
         * the inspection rather than only stopping the machine.
         */
        if (pausesMachine && analysis.maintenance.urgency === "URGENT" && !inspectsMachine) {
            violations.push("PAUSE_MACHINE under URGENT maintenance requires INSPECT_MACHINE");
        }

        return {
            planId: plan.id,
            compliant: violations.length === 0,
            violations: [...new Set(violations)],
        };
    }

    validateAll(plans: RecoveryPlan[], analysis: CrossFunctionalAnalysis): RecoveryPolicyValidation[] {
        return plans.map((plan) => this.validate(plan, analysis));
    }
}