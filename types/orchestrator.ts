import type { DiagnosticResult } from "@/types/diagnostic";
import type { Incident } from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";
import type { ProductionAssessment } from "@/types/production";
import type { QualityAssessment } from "@/types/quality";

export type OrchestrationStatus =
    | "COMPLETED"
    | "FAILED";

export interface CrossFunctionalAnalysis {
    incidentId: string;
    machineId: string;
    incidentSeverity: Incident["severity"];
    diagnosis: DiagnosticResult;
    quality: QualityAssessment;
    maintenance: MaintenanceAssessment;
    production: ProductionAssessment;
    generatedAt: string;
}

export interface OrchestrationResult {
    incidentId: string;
    status: OrchestrationStatus;
    analysis: CrossFunctionalAnalysis;
    completedAt: string;
}