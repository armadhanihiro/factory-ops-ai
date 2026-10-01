import type { ActionExecutionResult } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryAction } from "@/types/recovery";

export function executeHoldOutput(state: FactoryState, action: RecoveryAction, actionIndex: number): { state: FactoryState; result: ActionExecutionResult; } {
    if (action.type !== "HOLD_OUTPUT") {
        throw new Error("executeHoldOutput received an incompatible action");
    }

    if (!action.orderId) {
        throw new Error("HOLD_OUTPUT requires orderId");
    }

    const order = state.orders.find((item) => item.id === action.orderId);

    if (!order) {
        throw new Error(`Order ${action.orderId} does not exist`);
    }

    const nextState: FactoryState = {
        ...state,
        orders: state.orders.map((item) => item.id === action.orderId ? { ...item, status: "AT_RISK" } : item),
    };

    return {
        state: nextState,
        result: {
            actionIndex,
            action,
            status: "EXECUTED",
            message: `Output for order ${action.orderId} placed on hold`,
            executedAt: new Date().toISOString(),
        },
    };
}