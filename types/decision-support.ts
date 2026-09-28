export interface PlanTradeoff {
    planId: string;
    summary: string;
    advantages: string[];
    considerations: string[];
    policyConflictExplanation: string | null;
    unknowns: string[];
}

export interface DecisionSupportResult {
    incidentId: string;
    planTradeoffs: PlanTradeoff[];
    supervisorNote: string;
    generatedAt: string;
    provider: "mock" | "gemini";
}