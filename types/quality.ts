import type { Incident } from "@/types/factory";

export interface QualityEvidence {
    metric: string;
    observation: string;
    significance: string;
}

export interface QualityRisk {
    category: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    reasoning: string;
}

export interface QualityAssessment {
    incidentId: string;
    machineId: string;
    orderId: string | null;
    incidentSeverity: Incident["severity"];
    overallQualityRisk: "LOW" | "MEDIUM" | "HIGH";
    risks: QualityRisk[];
    evidence: QualityEvidence[];
    recommendedInspections: string[];
    dispositionRecommendation:
        | "CONTINUE_MONITORING"
        | "HOLD_FOR_INSPECTION"
        | "QUARANTINE_RECOMMENDED";
    reasoning: string;
    generatedAt: string;
    provider: "mock" | "gemini";
}