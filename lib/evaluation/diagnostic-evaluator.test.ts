import { describe, expect, it } from "vitest";
import type { DiagnosticResult } from "@/types/diagnostic";
import type { DiagnosticGroundTruth } from "@/types/evaluation";
import { evaluateDiagnosticResult } from "./diagnostic-evaluator";

const groundTruth: DiagnosticGroundTruth = {
    machineId: "M-02",
    failureMode: "bearing_degradation",
    rootCause: "Progressive wear in the main drive bearing",
};

function createDiagnosticResult(failureMode: string): DiagnosticResult {
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
                metric: "vibration",
                observation: "Vibration increased above baseline.",
                significance: "Elevated vibration indicates a potential mechanical issue.",
            },
        ],
        recommendedChecks: [
            "Inspect the machine for abnormal mechanical wear.",
        ],
        generatedAt: new Date().toISOString(),
        provider: "mock",
    };
}

describe("evaluateDiagnosticResult", () => {
    it("scores a correct diagnosis as 1", () => {
        const result = createDiagnosticResult("bearing_degradation");
        const evaluation = evaluateDiagnosticResult(result, groundTruth);

        expect(evaluation.diagnosisCorrect).toBe(true);
        expect(evaluation.diagnosisScore).toBe(1);
        expect(evaluation.overallScore).toBe(1);
    });

    it("scores an incorrect diagnosis as 0", () => {
        const result = createDiagnosticResult("shaft_misalignment");
        const evaluation = evaluateDiagnosticResult(result, groundTruth);

        expect(evaluation.diagnosisCorrect).toBe(false);
        expect(evaluation.diagnosisScore).toBe(0);

        // Evidence + output remain valid even though
        // the actual diagnosis is incorrect.
        expect(evaluation.evidenceGroundingScore).toBe(1);
        expect(evaluation.outputValidityScore).toBe(1);

        // 0 * 0.60 + 1 * 0.25 + 1 * 0.15
        expect(evaluation.overallScore).toBeCloseTo(0.4);
    });
});