import type { RecoveryEvaluation } from "@/types/recovery-evaluation";

import { getRecoveryApproval } from "@/lib/approval/store";
import { getRecoveryExecution } from "@/lib/execution/store";

import { evaluateRecoveryExecution } from "./evaluator";
import {
    getRecoveryEvaluationByExecution,
    saveRecoveryEvaluation,
} from "./store";

export function evaluateRecoveryExecutionById(executionId: string): RecoveryEvaluation {
    /*
     * Evaluation is idempotent per execution.
     *
     * Repeated API calls return the original evaluation
     * rather than producing multiple audit records.
     */
    const existingEvaluation = getRecoveryEvaluationByExecution(executionId);

    if (existingEvaluation) {
        return existingEvaluation;
    }

    const execution = getRecoveryExecution(executionId);

    if (!execution) {
        throw new Error(`Execution ${executionId} does not exist`);
    }

    /*
     * Recover the exact approved plan snapshot.
     */
    const approval = getRecoveryApproval(execution.approvalId);

    if (!approval) {
        throw new Error(`Approval ${execution.approvalId} does not exist`);
    }

    if (approval.planId !== execution.planId) {
        throw new Error("Execution plan does not match approval plan");
    }

    if (approval.planSnapshot.id !== execution.planId) {
        throw new Error("Approved plan snapshot does not match execution plan");
    }

    const evaluation = evaluateRecoveryExecution(execution, structuredClone(approval.planSnapshot));
    saveRecoveryEvaluation(evaluation);

    return evaluation;
}