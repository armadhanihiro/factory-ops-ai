import type { PlanTradeoff } from "@/types/decision-support";

import type { DecisionSupportContext } from "./types";

export interface DecisionSupportProvider {
    explainTradeoffs(context: DecisionSupportContext): Promise<{
        planTradeoffs: PlanTradeoff[];
        supervisorNote: string;
    }>;
}