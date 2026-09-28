import type { DecisionSupportResult } from "@/types/decision-support";

declare global {
    var decisionSupportResultStore:
        | Map<string, DecisionSupportResult>
        | undefined;
}

const store = globalThis.decisionSupportResultStore ?? new Map<string, DecisionSupportResult>();

if (!globalThis.decisionSupportResultStore) {
    globalThis.decisionSupportResultStore = store;
}

export function getDecisionSupportResult(incidentId: string): DecisionSupportResult | undefined {
    return store.get(incidentId);
}

export function saveDecisionSupportResult(result: DecisionSupportResult): void {
    store.set(result.incidentId, result);
}

export function clearDecisionSupportResults(): void {
    store.clear();
}