import type { Incident } from "@/types/factory";
import type { QualityEvaluation } from "@/types/evaluation";

import { getQualityResult } from "@/lib/agents/quality/result-store";
import { evaluateQualityResult } from "./quality-evaluator";

export async function evaluateIncidentQuality(incident: Incident): Promise<QualityEvaluation> {
    const qualityResult = getQualityResult(incident.id);

    if (!qualityResult) {
        throw new Error(`No quality assessment available for incident ${incident.id}`);
    }

    return evaluateQualityResult(qualityResult, incident);
}