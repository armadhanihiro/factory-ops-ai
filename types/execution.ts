import type { RecoveryAction } from "@/types/recovery";

export type ActionExecutionStatus =
    | "EXECUTED"
    | "FAILED";

export interface ActionExecutionResult {
    actionIndex: number;
    action: RecoveryAction;
    status: ActionExecutionStatus;
    message: string;
    executedAt: string;
}

export type RecoveryExecutionStatus =
    | "COMPLETED"
    | "PARTIALLY_COMPLETED"
    | "FAILED";

export interface RecoveryExecution {
    id: string;
    approvalId: string;
    incidentId: string;
    planId: string;
    status: RecoveryExecutionStatus;
    actionResults: ActionExecutionResult[];
    startedAt: string;
    completedAt: string;
}