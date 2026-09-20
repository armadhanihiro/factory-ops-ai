import { describe, expect, it } from "vitest";
import type { Incident } from "@/types/factory";
import type { DiagnosticResult } from "@/types/diagnostic";
import type { DiagnosticGroundTruth } from "@/types/evaluation";
import { evaluateDiagnosticResult } from "./diagnostic-evaluator";

const groundTruth: DiagnosticGroundTruth = {
    machineId: "M-02",
    failureMode: "bearing_degradation",
    rootCause: "Progressive wear in the main drive bearing",
};

const incident: Incident = {
    id: "INC-001",
    machineId: "M-02",
    status: "OPEN",
    severity: "HIGH",
    detectedAt: "2026-09-20T15:00:00.000Z",
    updatedAt: "2026-09-20T15:00:00.000Z",

    trigger: {
        anomalyScore: 0.65,
        signals: [
            {
                metric: "vibration",
                value: 7.46,
                baseline: 3.1,
                deviationPercent: 140.65,
                score: 0.83,
                message: "Vibration significantly above baseline.",
            },
            {
                metric: "temperature",
                value: 78.9,
                baseline: 71,
                deviationPercent: 11.13,
                score: 0.13,
                message: "Temperature above baseline.",
            },
        ],
    },
};

function createDiagnosticResult(failureMode: string, evidenceMetric = "vibration"): DiagnosticResult {
    return {
        incidentId: "INC-001",
        machineId: "M-02",
        severity: "HIGH",
        primaryDiagnosis: {
            failureMode,
            confidence: 0.86,
            reasoning: "Test diagnostic reasoning.",
        },
        alternativeHypotheses: [],
        evidence: [
            {
                metric: evidenceMetric,
                observation: "Metric increased above baseline.",
                significance: "The observed change may indicate a mechanical issue.",
            },
        ],
        recommendedChecks: [
            "Inspect the machine for abnormal mechanical wear.",
        ],
        generatedAt: "2026-09-20T15:01:00.000Z",
        provider: "mock",
    };
}

describe("evaluateDiagnosticResult", () => {
    it("scores a correct diagnosis with grounded evidence", () => {
        const result = createDiagnosticResult("bearing_degradation");
        const evaluation = evaluateDiagnosticResult(result, groundTruth, incident);

        expect(evaluation.diagnosisCorrect).toBe(true);
        expect(evaluation.diagnosisScore).toBe(1);
        expect(evaluation.evidenceGroundingScore).toBe(1);
        expect(evaluation.outputValidityScore).toBe(1);
        expect(evaluation.overallScore).toBe(1);
    });

    it("scores an incorrect diagnosis as 0", () => {
        const result = createDiagnosticResult("shaft_misalignment");
        const evaluation = evaluateDiagnosticResult(result, groundTruth, incident);

        expect(evaluation.diagnosisCorrect).toBe(false);
        expect(evaluation.diagnosisScore).toBe(0);
        expect(evaluation.evidenceGroundingScore).toBe(1);
        expect(evaluation.outputValidityScore).toBe(1);
        expect(evaluation.overallScore).toBeCloseTo(0.4);
    });

    it("penalizes evidence that is not present in incident telemetry", () => {
        const result = createDiagnosticResult("bearing_degradation", "oilPressure");
        const evaluation = evaluateDiagnosticResult(result, groundTruth, incident);

        expect(evaluation.diagnosisCorrect).toBe(true);
        expect(evaluation.diagnosisScore).toBe(1);
        expect(evaluation.evidenceGroundingScore).toBe(0);
        expect(evaluation.outputValidityScore).toBe(1);

        // 1 * 0.60 + 0 * 0.25 + 1 * 0.15
        expect(evaluation.overallScore).toBeCloseTo(0.75);
    });
});