import type { DiagnosticResult } from "@/types/diagnostic";

const globalForDiagnostics = globalThis as typeof globalThis & {
    diagnosticResults?: Map<string, DiagnosticResult>;
};

const diagnosticResults = globalForDiagnostics.diagnosticResults ?? new Map<string, DiagnosticResult>();

if (process.env.NODE_ENV !== "production") {
    globalForDiagnostics.diagnosticResults = diagnosticResults;
}

export function getDiagnosticResult(incidentId: string): DiagnosticResult | undefined {
    return diagnosticResults.get(incidentId);
}

export function saveDiagnosticResult(result: DiagnosticResult): DiagnosticResult {
    diagnosticResults.set(result.incidentId, result);
    return result;
}

export function clearDiagnosticResults(): void {
    diagnosticResults.clear();
}