import type { Incident } from "@/types/factory";

export interface DiagnosticEvidence {
    metric: string;
    observation: string;
    significance: string;
}

export interface DiagnosticHypothesis {
    failureMode: string;
    confidence: number;
    reasoning: string;
}

export interface DiagnosticResult {
    incidentId: string;
    machineId: string;
    severity: Incident["severity"];
    primaryDiagnosis: DiagnosticHypothesis;
    alternativeHypotheses: DiagnosticHypothesis[];
    evidence: DiagnosticEvidence[];
    recommendedChecks: string[];
    generatedAt: string;
    provider: "mock" | "gemini";
}