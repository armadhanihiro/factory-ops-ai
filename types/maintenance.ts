import type { Incident } from "@/types/factory";

export type MaintenanceUrgency =
    | "MONITOR"
    | "SCHEDULE_SOON"
    | "URGENT";

export interface MaintenanceEvidence {
    source: "INCIDENT" | "DIAGNOSIS";
    observation: string;
    significance: string;
}

export interface MaintenanceTask {
    task: string;
    purpose: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface MaintenanceAssessment {
    incidentId: string;
    machineId: string;
    incidentSeverity: Incident["severity"];
    urgency: MaintenanceUrgency;
    suspectedFailureMode: string;
    evidence: MaintenanceEvidence[];
    recommendedTasks: MaintenanceTask[];
    estimatedInterventionMinutes: number | null;
    requiredSkills: string[];
    partsToInspect: string[];
    operationalRecommendation:
        | "CONTINUE_WITH_MONITORING"
        | "PLAN_MAINTENANCE"
        | "IMMEDIATE_INSPECTION_RECOMMENDED";
    reasoning: string;
    generatedAt: string;
    provider: "mock" | "gemini";
}