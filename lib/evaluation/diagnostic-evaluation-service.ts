import type { FactoryState, Incident } from "@/types/factory";
import type { DiagnosticEvaluation } from "@/types/evaluation";
import { DiagnosticAgent } from "@/lib/agents/diagnostic/agent";
import { evaluateDiagnosticResult } from "./diagnostic-evaluator";
import { resolveDiagnosticGroundTruth } from "./ground-truth";

export async function evaluateIncidentDiagnosis(incident: Incident, factoryState: FactoryState): Promise<DiagnosticEvaluation> {
    // AI runs first using sanitized operational context.
    const agent = new DiagnosticAgent();
    const diagnosticResult = await agent.investigate(incident, factoryState);

    // Ground truth is accessed only after the diagnosis exists.
    const groundTruth = resolveDiagnosticGroundTruth(factoryState, incident.machineId);

    if (!groundTruth) {
        throw new Error(`No diagnostic ground truth available for machine ${incident.machineId}`);
    }

    return evaluateDiagnosticResult(diagnosticResult, groundTruth, incident);
}