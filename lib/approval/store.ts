import type { RecoveryApproval } from "@/types/approval";

declare global {
    var recoveryApprovalStore:
        | Map<string, RecoveryApproval>
        | undefined;
}

const store = globalThis.recoveryApprovalStore ?? new Map<string, RecoveryApproval>();

if (!globalThis.recoveryApprovalStore) {
    globalThis.recoveryApprovalStore = store;
}

export function getRecoveryApproval(approvalId: string): RecoveryApproval | undefined {
    return store.get(approvalId);
}

export function getRecoveryApprovalByIncident(incidentId: string): RecoveryApproval | undefined {
    return Array.from(store.values()).find((approval) => approval.incidentId === incidentId);
}

export function saveRecoveryApproval(approval: RecoveryApproval): void {
    store.set(approval.id, approval);
}

export function clearRecoveryApprovals(): void {
    store.clear();
}