import type { OrchestrationResult } from "@/types/orchestrator";

const globalForOrchestrator = globalThis as typeof globalThis & {
    orchestrationResults?: Map<string, OrchestrationResult>;
};
const orchestrationResults = globalForOrchestrator.orchestrationResults ?? new Map<string, OrchestrationResult>();

if (process.env.NODE_ENV !== "production") {
    globalForOrchestrator.orchestrationResults = orchestrationResults;
}

export function getOrchestrationResult(incidentId: string): OrchestrationResult | undefined {
    return orchestrationResults.get(incidentId);
}

export function saveOrchestrationResult(result: OrchestrationResult): void {
    orchestrationResults.set(result.incidentId, result);
}

export function clearOrchestrationResults(): void {
    orchestrationResults.clear();
}