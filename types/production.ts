import type { Incident } from "@/types/factory";

export type ProductionImpactLevel =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

export interface ProductionEvidence {
    metric: string;
    value: string;
    significance: string;
}

export interface ProductionAlternative {
    machineId: string;
    available: boolean;
    capacity: number;
    reasoning: string;
}

export interface ProductionAssessment {
    incidentId: string;
    machineId: string;
    incidentSeverity: Incident["severity"];
    affectedOrderId: string | null;
    impactLevel: ProductionImpactLevel;
    remainingUnits: number | null;
    currentMachineCapacity: number;
    productionAtRisk: boolean;
    alternatives: ProductionAlternative[];
    evidence: ProductionEvidence[];
    recommendedStrategy:
        | "CONTINUE_CURRENT_PLAN"
        | "PREPARE_BACKUP_CAPACITY"
        | "REROUTE_RECOMMENDED"
        | "PAUSE_AND_REPLAN";

    reasoning: string;
    generatedAt: string;
    provider: "mock" | "gemini";
}