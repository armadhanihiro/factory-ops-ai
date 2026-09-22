import { describe, expect, it } from "vitest";

import type { Incident } from "@/types/factory";
import type { QualityAssessment } from "@/types/quality";

import { evaluateQualityResult } from "./quality-evaluator";

const incident: Incident = {
    id: "INC-001",
    machineId: "M-02",
    status: "OPEN",
    severity: "HIGH",
    detectedAt: "2026-09-23T00:00:00.000Z",
    updatedAt: "2026-09-23T00:00:00.000Z",
    trigger: {
        anomalyScore: 0.8,
        signals: [
            {
                metric: "vibration",
                value: 7.25,
                baseline: 3.1,
                deviationPercent: 133.9,
                score: 0.84,
                message: "Vibration elevated",
            },
            {
                metric: "defectRate",
                value: 1.55,
                baseline: 1.1,
                deviationPercent: 40.9,
                score: 0.04,
                message: "Defect rate elevated",
            },
        ],
    },
};

const assessment: QualityAssessment = {
  incidentId: "INC-001",
  machineId: "M-02",
  orderId: "ORD-428",
  incidentSeverity: "HIGH",
  overallQualityRisk: "HIGH",
  risks: [
        {
            category: "PRODUCT_CONFORMANCE",
            severity: "HIGH",
            reasoning: "Quality risk is elevated.",
        },
  ],
  evidence: [
        {
            metric: "defectRate",
            observation: "1.55 compared with baseline 1.1",
            significance: "Defect rate is elevated.",
        },
  ],
  recommendedInspections: [
        "Inspect affected units.",
  ],
  dispositionRecommendation: "HOLD_FOR_INSPECTION",
  reasoning: "Observed quality telemetry indicates elevated risk.",
  generatedAt: "2026-09-23T00:00:00.000Z",
  provider: "mock",
};

describe("evaluateQualityResult", () => {
    it("gives full grounding to supported evidence", () => {
        const result = evaluateQualityResult(assessment, incident);

        expect(result.evidenceGroundingScore).toBe(1);
        expect(result.dispositionSafetyScore).toBe(1);
        expect(result.outputValidityScore).toBe(1);
        expect(result.overallScore).toBe(1);
    });

    it("rejects evidence metrics absent from the incident", () => {
        const result = evaluateQualityResult(
            {
                ...assessment,
                evidence: [
                {
                    metric: "humidity",
                    observation: "Humidity increased.",
                    significance:
                    "Could affect product quality.",
                },
                ],
            },
            incident
        );

        expect(result.evidenceGroundingScore).toBe(0);
        expect(result.overallScore).toBe(0.5);
    });
});