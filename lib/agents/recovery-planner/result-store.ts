import type { RecoveryPlannerResult } from "@/types/recovery-planner";

declare global {
    var recoveryPlannerResultStore:
        | Map<string, RecoveryPlannerResult>
        | undefined;
}

const store = globalThis.recoveryPlannerResultStore ?? new Map<string, RecoveryPlannerResult>();

if (!globalThis.recoveryPlannerResultStore) {
    globalThis.recoveryPlannerResultStore = store;
}

export function getRecoveryPlannerResult( incidentId: string): RecoveryPlannerResult | undefined {
    return store.get(incidentId);
}

export function saveRecoveryPlannerResult(result: RecoveryPlannerResult): void {
    store.set(result.incidentId, result);
}

export function clearRecoveryPlannerResults(): void {
    store.clear();
}