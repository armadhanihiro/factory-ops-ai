import type { Incident } from "@/types/factory";
import type { QualityAssessment } from "@/types/quality";
import type { QualityEvaluation } from "@/types/evaluation";

function normalizeMetric(metric: string): string {
    return metric.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function evaluateEvidenceGrounding(result: QualityAssessment, incident: Incident): number {
    if (result.evidence.length === 0) {
        return 0;
    }

    const incidentMetrics = new Set(incident.trigger.signals.map((signal) => normalizeMetric(signal.metric)));
    const groundedEvidence = result.evidence.filter((evidence) => incidentMetrics.has(normalizeMetric(evidence.metric)) &&
                            evidence.observation.trim().length > 0 && evidence.significance.trim().length > 0);

    return groundedEvidence.length / result.evidence.length;
}

function evaluateDispositionSafety(result: QualityAssessment): number {
    const allowed = new Set([
        "CONTINUE_MONITORING",
        "HOLD_FOR_INSPECTION",
        "QUARANTINE_RECOMMENDED",
    ]);

    return allowed.has(result.dispositionRecommendation) ? 1 : 0;
}

function evaluateOutputValidity(result: QualityAssessment): number {
    const checks = [
        result.incidentId.trim().length > 0,
        result.machineId.trim().length > 0,
        ["LOW", "MEDIUM", "HIGH"].includes(result.overallQualityRisk),
        result.risks.length > 0,
        result.evidence.length > 0,
        result.recommendedInspections.length > 0,
        result.reasoning.trim().length > 0,
    ];
    const passed = checks.filter(Boolean).length;

    return passed / checks.length;
}

export function evaluateQualityResult(result: QualityAssessment, incident: Incident): QualityEvaluation {
  const evidenceGroundingScore = evaluateEvidenceGrounding(result, incident);
  const dispositionSafetyScore = evaluateDispositionSafety(result);
  const outputValidityScore = evaluateOutputValidity(result);
  const overallScore = evidenceGroundingScore * 0.5 + dispositionSafetyScore * 0.25 + outputValidityScore * 0.25;

  return {
    incidentId: result.incidentId,
    machineId: result.machineId,
    evidenceGroundingScore,
    dispositionSafetyScore,
    outputValidityScore,
    overallScore,
    provider: result.provider,
    evaluatedAt: new Date().toISOString(),
  };
}