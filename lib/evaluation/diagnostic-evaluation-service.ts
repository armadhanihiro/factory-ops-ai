import type { FactoryState, Incident } from "@/types/factory";
import type { DiagnosticEvaluation } from "@/types/evaluation";

import { getDiagnosticResult } from "@/lib/agents/diagnostic/result-store";

import { evaluateDiagnosticResult } from "./diagnostic-evaluator";
import { resolveDiagnosticGroundTruth } from "./ground-truth";

export async function evaluateIncidentDiagnosis(incident: Incident, factoryState: FactoryState): Promise<DiagnosticEvaluation> {
    const diagnosticResult = getDiagnosticResult(incident.id);

    if (!diagnosticResult) {
        throw new Error(`No diagnostic result available for incident ${incident.id}`);
    }

    const groundTruth = resolveDiagnosticGroundTruth(factoryState, incident.machineId);

    if (!groundTruth) {
        throw new Error(`No diagnostic ground truth available for machine ${incident.machineId}`);
    }

    return evaluateDiagnosticResult(diagnosticResult, groundTruth, incident);
}