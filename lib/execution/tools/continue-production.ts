import type { ActionExecutionResult } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryAction } from "@/types/recovery";

export function executeContinueProduction(state: FactoryState, action: RecoveryAction, actionIndex: number): { state: FactoryState; result: ActionExecutionResult; } {
    if (action.type !== "CONTINUE_PRODUCTION") {
        throw new Error("executeContinueProduction received an incompatible action");
    }

    if (!action.machineId) {
        throw new Error("CONTINUE_PRODUCTION requires machineId");
    }

    const machine = state.machines.find((item) => item.id === action.machineId);

    if (!machine) {
        throw new Error(`Machine ${action.machineId} does not exist`);
    }

    if (machine.status !== "RUNNING") {
        throw new Error(`Machine ${action.machineId} is not currently running`);
    }

    return {
        state,
        result: {
            actionIndex,
            action,
            status: "EXECUTED",
            message: `Production continues on machine ${action.machineId}`,
            executedAt: new Date().toISOString(),
        },
    };
}