import type { FactoryState } from "@/types/factory";
import type {
    RecoveryAction,
    RecoverySimulationOutcome,
} from "@/types/recovery";

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
    predictionSnapshot: RecoverySimulationOutcome;
    factoryStateBefore: FactoryState;
    factoryStateAfter: FactoryState;
    startedAt: string;
    completedAt: string;
}