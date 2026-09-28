import type { RecoveryPlan } from "@/types/recovery";
import type {
    RecoveryPolicyValidation,
    RecoverySimulationOutcome,
} from "@/types/recovery";

export interface VerifiedRecoveryPlan {
    plan: RecoveryPlan;
    policyValidation: RecoveryPolicyValidation;
    simulationOutcome: RecoverySimulationOutcome;
}

export interface DecisionSupportContext {
    incidentId: string;
    incidentSeverity: string;
    plans: VerifiedRecoveryPlan[];
}