import { describe, expect, it } from "vitest";

import { MaintenanceAgent } from "./agent";

import type {
    FactoryState,
    Incident,
    Machine,
} from "@/types/factory";
import type { DiagnosticResult } from "@/types/diagnostic";

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
                value: 7.2,
                baseline: 3.1,
                deviationPercent: 132.3,
                score: 0.84,
                message: "Vibration elevated",
            },
        ],
    },
};

const machine: Machine = {
    id: "M-02",
    name: "Extruder A",
    type: "EXTRUDER",
    status: "WARNING",
    capacity: 120,
    currentOrderId: "ORD-428",
    telemetry: {
        machineId: "M-02",
        timestamp: "2026-09-23T00:00:00.000Z",
        temperature: 79,
        vibration: 7.2,
        motorCurrent: 42,
        pressure: 118,
        outputRate: 110,
        defectRate: 1.6,
    },
};

const factoryState: FactoryState = {
    timestamp: "2026-09-23T00:00:00.000Z",
    machines: [machine],
    orders: [],
    totalOutput: 110,
    averageUtilization: 92,
    anomalies: [],
    incidents: [incident],
};

const diagnosis: DiagnosticResult = {
    incidentId: "INC-001",
    machineId: "M-02",
    severity: "HIGH",
    primaryDiagnosis: {
        failureMode: "bearing_degradation",
        confidence: 0.86,
        reasoning: "Elevated vibration is consistent with progressive bearing wear.",
    },
    alternativeHypotheses: [],
    evidence: [
        {
            metric: "vibration",
            observation: "7.2 compared with baseline 3.1",
            significance: "Substantial vibration increase indicates mechanical degradation.",
        },
    ],
    recommendedChecks: [
        "Inspect bearing condition.",
    ],
    generatedAt: "2026-09-23T00:00:00.000Z",
    provider: "mock",
};

describe("MaintenanceAgent", () => {
    it("uses an existing diagnosis to assess maintenance needs", async () => {
        const agent = new MaintenanceAgent();
        const result = await agent.assessMaintenanceNeeds(incident, factoryState, diagnosis);

        expect(result.incidentId).toBe("INC-001");
        expect(result.machineId).toBe("M-02");
        expect(result.suspectedFailureMode).toBe("bearing_degradation");
        expect(result.urgency).toBe("URGENT");
        expect(result.operationalRecommendation).toBe("IMMEDIATE_INSPECTION_RECOMMENDED");
        expect(result.evidence).toEqual(expect.arrayContaining([
            expect.objectContaining({ source: "DIAGNOSIS" }),
            expect.objectContaining({ source: "INCIDENT" }),
        ])
        );
        expect(result.provider).toBe("mock");
    });

    it("rejects a diagnosis from another incident", async () => {
        const agent = new MaintenanceAgent();
        const mismatchedDiagnosis: DiagnosticResult = {
            ...diagnosis,
            incidentId: "INC-999",
        };

        await expect(agent.assessMaintenanceNeeds(incident, factoryState, mismatchedDiagnosis)).rejects.toThrow("Diagnosis does not belong to incident INC-001");
    });
});