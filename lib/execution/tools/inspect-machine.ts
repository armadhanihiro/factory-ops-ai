import type { ActionExecutionResult } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryAction } from "@/types/recovery";

export function executeInspectMachine(state: FactoryState, action: RecoveryAction, actionIndex: number): { state: FactoryState; result: ActionExecutionResult; } {
    if (action.type !== "INSPECT_MACHINE") {
        throw new Error("executeInspectMachine received an incompatible action");
    }

    if (!action.machineId) {
        throw new Error("INSPECT_MACHINE requires machineId");
    }

    const machine = state.machines.find((item) => item.id === action.machineId);

    if (!machine) {
        throw new Error(`Machine ${action.machineId} does not exist`);
    }

    return {
        state: {
            ...state,
            machines: state.machines.map((item) => item.id === action.machineId ? { ...item, status: "MAINTENANCE" } : item),
        },

        result: {
            actionIndex,
            action,
            status: "EXECUTED",
            message: `Machine ${action.machineId} moved to inspection`,
            executedAt: new Date().toISOString(),
        },
    };
}