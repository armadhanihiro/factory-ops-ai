import type { Incident } from "@/types/factory";

export type RecoveryActionType =
    | "CONTINUE_PRODUCTION"
    | "PAUSE_MACHINE"
    | "INSPECT_MACHINE"
    | "REROUTE_ORDER"
    | "HOLD_OUTPUT";

export interface RecoveryAction {
    type: RecoveryActionType;
    machineId?: string;
    orderId?: string;
    targetMachineId?: string;
    reasoning: string;
}

export interface RecoveryPlan {
    id: string;
    name: string;
    description: string;
    incidentId: string;
    machineId: string;
    actions: RecoveryAction[];
    rationale: string;
}

export interface RecoverySimulationOutcome {
    planId: string;
    feasible: boolean;
    constraintViolations: string[];
    productionMachineId: string | null;
    productionCapacityPerHour: number;
    remainingUnits: number;
    estimatedProductionHours: number | null;
    estimatedInterventionMinutes: number | null;
    estimatedTotalRecoveryMinutes: number | null;
    qualityHoldRequired: boolean;
    machineInspectionRequired: boolean;
    calculatedAt: string;
}

export interface RecoverySimulationResult {
    incidentId: string;
    incidentSeverity: Incident["severity"];
    outcomes: RecoverySimulationOutcome[];
    simulatedAt: string;
}

export interface RecoveryPolicyValidation {
    planId: string;
    compliant: boolean;
    violations: string[];
}

export interface RecoveryAnalysisResult {
    incidentId: string;
    incidentSeverity: Incident["severity"];
    plans: RecoveryPlan[];
    policyValidations: RecoveryPolicyValidation[];
    simulation: RecoverySimulationResult;
    analyzedAt: string;
}