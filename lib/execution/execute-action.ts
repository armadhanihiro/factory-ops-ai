import type { ActionExecutionResult } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryAction } from "@/types/recovery";

import { executeContinueProduction } from "./tools/continue-production";
import { executeHoldOutput } from "./tools/hold-output";
import { executeInspectMachine } from "./tools/inspect-machine";
import { executePauseMachine } from "./tools/pause-machine";
import { executeRerouteOrder } from "./tools/reroute-order";

export function executeRecoveryAction(state: FactoryState, action: RecoveryAction, actionIndex: number): { state: FactoryState; result: ActionExecutionResult; } {
    switch (action.type) {
        case "CONTINUE_PRODUCTION":
            return executeContinueProduction(state, action, actionIndex);

        case "PAUSE_MACHINE":
            return executePauseMachine(state, action, actionIndex);

        case "INSPECT_MACHINE":
            return executeInspectMachine(state, action, actionIndex);

        case "REROUTE_ORDER":
            return executeRerouteOrder(state, action, actionIndex);

        case "HOLD_OUTPUT":
            return executeHoldOutput(state, action, actionIndex);

        default: {
            const exhaustiveCheck: never = action.type;
            throw new Error(`Unsupported recovery action: ${exhaustiveCheck}`);
        }
    }
}