import type { RecoveryPlan } from "@/types/recovery";

export interface RecoveryPlannerResult {
    incidentId: string;
    plans: RecoveryPlan[];
    generatedAt: string;
    provider: "mock" | "gemini";
}