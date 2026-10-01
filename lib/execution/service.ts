import type { RecoveryExecutionResult } from "./engine";

import { getRecoveryApproval } from "@/lib/approval/store";
import {
    getFactoryState,
    updateFactoryState,
} from "@/lib/simulator/store";

import { executeApprovedRecoveryPlan } from "./engine";
import {
    getRecoveryExecutionByApproval,
    saveRecoveryExecution,
} from "./store";

export async function executeRecoveryApproval(approvalId: string): Promise<RecoveryExecutionResult> {
    const approval = getRecoveryApproval(approvalId);

    if (!approval) {
        throw new Error(`Approval ${approvalId} does not exist`);
    }

    if (approval.status !== "APPROVED") {
        throw new Error(`Approval ${approvalId} is not APPROVED`);
    }

    /*
     * Execution is intentionally one-shot.
     * An approved recovery plan must never be
     * applied to factory state twice.
     */
    const existingExecution = getRecoveryExecutionByApproval(approvalId);

    if (existingExecution) {
        throw new Error(`Approval ${approvalId} has already been executed`);
    }

    /*
     * Execute exactly the plan snapshot that
     * the supervisor reviewed and approved.
     */
    const plan = structuredClone(approval.planSnapshot);

    if (plan.id !== approval.planId) {
        throw new Error("Approved plan snapshot does not match approval planId");
    }

    const currentState = getFactoryState();

    const result = await executeApprovedRecoveryPlan(approval, plan, currentState);

    /*
     * Failed validation/action execution must never
     * mutate the global simulator state.
     */
    if (!result.executed) {
        return result;
    }

    /*
     * Atomic prototype commit:
     * the complete resulting state is written once,
     * only after every recovery action succeeds.
     */
    updateFactoryState(() => result.factoryState);

    if (!result.execution) {
        throw new Error("Execution completed without an audit record");
    }

    saveRecoveryExecution(result.execution);

    return result;
}