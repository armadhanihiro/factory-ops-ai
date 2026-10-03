import type { RecoveryExecution } from "@/types/execution";
import type { FactoryState } from "@/types/factory";
import type { RecoveryPlan } from "@/types/recovery";
import type { RecoveryApproval } from "@/types/approval";

import { executeRecoveryAction } from "./execute-action";
import { validateBeforeExecution } from "./pre-execution-validator";

export interface RecoveryExecutionResult {
    execution: RecoveryExecution | null;
    factoryState: FactoryState;
    executed: boolean;
    blockingReasons: string[];
}

function cloneFactoryState(state: FactoryState): FactoryState {
    return structuredClone(state);
}

export async function executeApprovedRecoveryPlan(approval: RecoveryApproval, plan: RecoveryPlan, currentState: FactoryState): Promise<RecoveryExecutionResult> {
    const validation = await validateBeforeExecution(approval, plan, currentState);

    if (!validation.valid) {
        return {
            execution: null,
            factoryState: currentState,
            executed: false,
            blockingReasons: validation.blockingReasons,
        };
    }

    if (!validation.prediction) {
        return {
            execution: null,
            factoryState: currentState,
            executed: false,
            blockingReasons: ["Execution validation completed without a simulation prediction"],
        };
    }

    const startedAt = new Date().toISOString();
    let workingState = cloneFactoryState(currentState);
    const actionResults = [];

    try {
        for (let index = 0; index < plan.actions.length; index += 1) {
            const execution = executeRecoveryAction(workingState, plan.actions[index], index);
            workingState = execution.state;
            actionResults.push(execution.result);
        }
    } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown execution error";

        return {
            execution: null,
            factoryState: currentState,
            executed: false,
            blockingReasons: [`Execution blocked: ${reason}`],
        };
    }

    const completedAt = new Date().toISOString();

    const execution: RecoveryExecution = {
        id: `EXECUTION-${approval.id}`,
        approvalId: approval.id,
        incidentId: approval.incidentId,
        planId: plan.id,
        status: "COMPLETED",
        actionResults,
        predictionSnapshot: structuredClone(validation.prediction),
        factoryStateBefore: structuredClone(currentState),
        factoryStateAfter: structuredClone(workingState),
        startedAt,
        completedAt,
    };

    return {
        execution,
        factoryState: workingState,
        executed: true,
        blockingReasons: [],
    };
}