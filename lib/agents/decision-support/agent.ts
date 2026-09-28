import type { DecisionSupportResult } from "@/types/decision-support";

import { createDecisionSupportProvider } from "./provider-factory";
import type { DecisionSupportContext } from "./types";

export class DecisionSupportAgent {
    async explain(context: DecisionSupportContext): Promise<DecisionSupportResult> {
        const provider = createDecisionSupportProvider();

        const result = await provider.explainTradeoffs(context);

        return {
            incidentId: context.incidentId,
            planTradeoffs: result.planTradeoffs,
            supervisorNote: result.supervisorNote,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}