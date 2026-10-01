import type { RecoveryExecution } from "@/types/execution";

declare global {
    var recoveryExecutionStore:
        | Map<string, RecoveryExecution>
        | undefined;
}

const store = globalThis.recoveryExecutionStore ?? new Map<string, RecoveryExecution>();

if (!globalThis.recoveryExecutionStore) {
    globalThis.recoveryExecutionStore = store;
}

export function getRecoveryExecution(executionId: string): RecoveryExecution | undefined {
    return store.get(executionId);
}

export function getRecoveryExecutionByApproval(approvalId: string): RecoveryExecution | undefined {
    return Array.from(store.values()).find((execution) => execution.approvalId === approvalId);
}

export function saveRecoveryExecution(execution: RecoveryExecution): void {
    store.set(execution.id, execution);
}

export function clearRecoveryExecutions(): void {
    store.clear();
}