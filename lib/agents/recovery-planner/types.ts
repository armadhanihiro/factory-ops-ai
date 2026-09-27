import type { CrossFunctionalAnalysis } from "@/types/orchestrator";

export interface RecoveryPlannerContext {
    incidentId: string;
    machineId: string;
    affectedOrderId: string;
    analysis: CrossFunctionalAnalysis;
}