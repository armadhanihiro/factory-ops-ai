import { describe, expect, it } from "vitest";

import type { DiagnosticResult } from "@/types/diagnostic";
import type { Incident } from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";

import { evaluateMaintenanceAssessment } from "./maintenance-evaluator";

const incident: Incident = {
    id: "INC-001",
    machineId: "M-02",
    status: "INVESTIGATING",
    severity: "HIGH",
    detectedAt: "2026-09-23T10:00:00.000Z",
    updatedAt: "2026-09-23T10:00:00.000Z",
    trigger: {
        anomalyScore: 0.89,
        signals: [
            {
                metric: "vibration",
                value: 7.3,
                baseline: 3.1,
                deviationPercent: 135.5,
                score: 0.89,
                message: "Vibration significantly above baseline",
            },
            {
                metric: "temperature",
                value: 80.7,
                baseline: 71,
                deviationPercent: 13.7,
                score: 0.21,
                message: "Temperature above baseline",
            },
        ],
    },
};

const diagnosis: DiagnosticResult = {
    incidentId: "INC-001",
    machineId: "M-02",
    severity: "HIGH",
    primaryDiagnosis: {
        failureMode: "Mechanical Component Wear or Misalignment",
        confidence: 0.85,
        reasoning: "Elevated vibration indicates possible mechanical wear or misalignment.",
    },
    alternativeHypotheses: [],
    evidence: [
        {
            metric: "vibration",
            observation: "Current vibration 7.3, baseline 3.1",
            significance: "Large deviation suggests a mechanical anomaly.",
        },
    ],
    recommendedChecks: ["Inspect rotating mechanical components."],
    generatedAt: "2026-09-23T10:01:00.000Z",
    provider: "gemini",
};

function createAssessment(overrides: Partial<MaintenanceAssessment> = {}): MaintenanceAssessment {
    return {
        incidentId: "INC-001",
        machineId: "M-02",
        incidentSeverity: "HIGH",
        urgency: "URGENT",
        suspectedFailureMode: "Mechanical Component Wear or Misalignment",
        evidence: [
            {
                source: "INCIDENT",
                observation: "Vibration current value 7.3 compared with baseline 3.1.",
                significance: "Vibration is significantly above baseline.",
            },
            {
                source: "DIAGNOSIS",
                observation: "Elevated vibration indicates mechanical wear.",
                significance: "Supports the supplied mechanical diagnosis.",
            },
        ],
        recommendedTasks: [
            {
                task: "Inspect rotating mechanical components",
                purpose: "Check for wear, looseness, or misalignment.",
                priority: "HIGH",
            },
        ],
        estimatedInterventionMinutes: null,
        requiredSkills: ["Mechanical Inspection"],
        partsToInspect: [
            "Bearings",
            "Shafts",
            "Couplings",
        ],
        operationalRecommendation: "IMMEDIATE_INSPECTION_RECOMMENDED",
        reasoning: "The supplied diagnosis and vibration evidence justify an urgent inspection.",
        generatedAt: "2026-09-23T10:02:00.000Z",
        provider: "gemini",
        ...overrides,
    };
}

describe("evaluateMaintenanceAssessment", () => {
    it("scores an assessment consistent with the upstream diagnosis", () => {
        const assessment = createAssessment();
        const result = evaluateMaintenanceAssessment(assessment, incident, diagnosis);

        expect(result.diagnosisConsistencyScore).toBe(1);
    });

    it("scores zero when the maintenance failure mode changes the upstream diagnosis", () => {
        const assessment = createAssessment({ suspectedFailureMode: "Electrical Motor Failure" });
        const result = evaluateMaintenanceAssessment(assessment, incident, diagnosis);

        expect(result.diagnosisConsistencyScore).toBe(0);
    });

    it("recognizes grounded maintenance evidence", () => {
        const assessment = createAssessment();
        const result = evaluateMaintenanceAssessment(assessment, incident, diagnosis);

        expect(result.evidenceGroundingScore).toBeGreaterThan(0);
    });

    it("accepts a structurally valid maintenance assessment", () => {
        const assessment = createAssessment();
        const result = evaluateMaintenanceAssessment(assessment, incident, diagnosis);

        expect(result.outputValidityScore).toBe(1);
        expect(result.safetyScore).toBe(1);
    });

    it("accepts null intervention duration when no reliable estimate exists", () => {
        const assessment = createAssessment({ estimatedInterventionMinutes: null });
        const result = evaluateMaintenanceAssessment(assessment, incident, diagnosis);

        expect(result.outputValidityScore).toBe(1);
    });
});