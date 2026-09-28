import type { FactoryState } from "@/types/factory";
import type { DecisionSupportResult } from "@/types/decision-support";

import { analyzeIncidentRecovery } from "@/lib/recovery/analysis-service";

import { DecisionSupportAgent } from "./agent";
import { buildDecisionSupportContext } from "./context";
import {
    getDecisionSupportResult,
    saveDecisionSupportResult,
} from "./result-store";

export async function getOrCreateDecisionSupport(incidentId: string, factoryState: FactoryState): Promise<DecisionSupportResult> {
    const cached = getDecisionSupportResult(incidentId);

    if (cached) {
        return cached;
    }

    const recoveryAnalysis = await analyzeIncidentRecovery(incidentId, factoryState);
    const context = buildDecisionSupportContext(recoveryAnalysis);
    const agent = new DecisionSupportAgent();
    const result = await agent.explain(context);
    saveDecisionSupportResult(result);

    return result;
}