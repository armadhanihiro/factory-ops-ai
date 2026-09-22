import type { Incident } from "@/types/factory";
import type { DiagnosticResult } from "@/types/diagnostic";
import type {
    DiagnosticEvaluation,
    DiagnosticGroundTruth,
} from "@/types/evaluation";

import { scoreFailureMode } from "./failure-mode-taxonomy";

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

function normalizeMetric(value: string): string {
    return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function evaluateDiagnosis(result: DiagnosticResult, groundTruth: DiagnosticGroundTruth): number {
    return scoreFailureMode(result.primaryDiagnosis.failureMode, groundTruth.failureMode);
}

function evaluateEvidenceGrounding(result: DiagnosticResult, incident: Incident): number {
    if (result.evidence.length === 0) {
        return 0;
    }

    const availableMetrics = new Set(incident.trigger.signals.map((signal) => normalizeMetric(signal.metric)));

    const groundedEvidence = result.evidence.filter((item) => {
        const metric = normalizeMetric(item.metric);

        return (availableMetrics.has(metric) && item.observation.trim().length > 0 && item.significance.trim().length > 0);
    });

    return clamp01(groundedEvidence.length / result.evidence.length);
}

function evaluateOutputValidity(result: DiagnosticResult): number {
  const checks = [
        result.incidentId.length > 0,
        result.machineId.length > 0,
        result.primaryDiagnosis.failureMode.length > 0,
        result.primaryDiagnosis.reasoning.length > 0,
        result.primaryDiagnosis.confidence >= 0 && result.primaryDiagnosis.confidence <= 1,
        result.evidence.length > 0,
        result.recommendedChecks.length > 0,
  ];

  const passed = checks.filter(Boolean).length;

  return clamp01(passed / checks.length);
}

export function evaluateDiagnosticResult(result: DiagnosticResult, groundTruth: DiagnosticGroundTruth, incident: Incident): DiagnosticEvaluation {
    const diagnosisScore = evaluateDiagnosis(result, groundTruth);
    const evidenceGroundingScore = evaluateEvidenceGrounding(result, incident);
    const outputValidityScore = evaluateOutputValidity(result);
    const overallScore = clamp01(diagnosisScore * 0.6 + evidenceGroundingScore * 0.25 + outputValidityScore * 0.15);

    return {
        incidentId: result.incidentId,
        machineId: result.machineId,
        diagnosisCorrect: diagnosisScore === 1,
        diagnosisScore,
        evidenceGroundingScore,
        outputValidityScore,
        overallScore,
        expectedFailureMode: groundTruth.failureMode,
        predictedFailureMode: result.primaryDiagnosis.failureMode,
        provider: result.provider,
        evaluatedAt: new Date().toISOString(),
    };
}