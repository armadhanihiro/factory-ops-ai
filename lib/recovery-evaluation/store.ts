import type { RecoveryEvaluation } from "@/types/recovery-evaluation";

declare global {
    var recoveryEvaluationStore:
        | Map<string, RecoveryEvaluation>
        | undefined;
}

const store = globalThis.recoveryEvaluationStore ?? new Map<string, RecoveryEvaluation>();

if (!globalThis.recoveryEvaluationStore) {
    globalThis.recoveryEvaluationStore = store;
}

export function getRecoveryEvaluation(evaluationId: string): RecoveryEvaluation | undefined {
    return store.get(evaluationId);
}

export function getRecoveryEvaluationByExecution(executionId: string): RecoveryEvaluation | undefined {
    return Array.from(store.values()).find((evaluation) => evaluation.executionId === executionId);
}

export function saveRecoveryEvaluation(evaluation: RecoveryEvaluation): void {
    store.set(evaluation.id, evaluation);
}

export function clearRecoveryEvaluations(): void {
    store.clear();
}