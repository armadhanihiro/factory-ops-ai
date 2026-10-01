import type { ActionExecutionResult } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryAction } from "@/types/recovery";

export function executeRerouteOrder(state: FactoryState, action: RecoveryAction, actionIndex: number): { state: FactoryState; result: ActionExecutionResult; } {
    if (action.type !== "REROUTE_ORDER") {
        throw new Error("executeRerouteOrder received an incompatible action");
    }

    if (!action.orderId || !action.targetMachineId) {
        throw new Error("REROUTE_ORDER requires orderId and targetMachineId");
    }

    const order = state.orders.find((item) => item.id === action.orderId);

    if (!order) {
        throw new Error(`Order ${action.orderId} does not exist`);
    }

    const targetMachine = state.machines.find((item) => item.id === action.targetMachineId);

    if (!targetMachine) {
        throw new Error(`Target machine ${action.targetMachineId} does not exist`);
    }

    if (targetMachine.status !== "IDLE") {
        throw new Error(`Target machine ${targetMachine.id} is not available`);
    }

    const nextState: FactoryState = {
        ...state,
        machines: state.machines.map(
            (machine) => {
                if (machine.id === action.targetMachineId) {
                    return {
                        ...machine,
                        status: "RUNNING",
                        currentOrderId: action.orderId,
                    };
                }

                if (machine.currentOrderId === action.orderId) {
                    return {
                        ...machine,
                        currentOrderId: undefined,
                    };
                }

                return machine;
            },
        ),

        orders: state.orders.map((item) => item.id === action.orderId ? { ...item, assignedMachineId: action.targetMachineId! } : item),
    };

    return {
        state: nextState,
        result: {
            actionIndex,
            action,
            status: "EXECUTED",
            message: `Order ${action.orderId} rerouted to ${action.targetMachineId}`,
            executedAt: new Date().toISOString(),
        },
    };
}