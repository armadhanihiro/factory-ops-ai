import type { RecoveryActionType } from "@/types/recovery";

export type RecoveryEvaluationOutcome =
    | "RECOVERY_ACTIONS_ACHIEVED"
    | "RECOVERY_ACTIONS_PARTIALLY_ACHIEVED"
    | "RECOVERY_ACTIONS_FAILED";

export interface RecoveryActionEvaluation {
    actionIndex: number;
    actionType: RecoveryActionType;
    achieved: boolean;
    observation: string;
}

export interface RecoveryPredictionComparison {
    expectedProductionMachineId: string | null;
    actualProductionMachineId: string | null;
    productionMachineMatched: boolean;
    expectedQualityHold: boolean;
    actualQualityHold: boolean;
    qualityHoldMatched: boolean;
    expectedInspection: boolean;
    actualInspection: boolean;
    inspectionMatched: boolean;
    matchedPredictions: number;
    totalPredictions: number;
}

export interface RecoveryEvaluation {
    id: string;
    executionId: string;
    incidentId: string;
    planId: string;
    expectedActions: number;
    achievedActions: number;
    actionEvaluations: RecoveryActionEvaluation[];
    predictionComparison: RecoveryPredictionComparison;
    outcome: RecoveryEvaluationOutcome;
    evaluatedAt: string;
}