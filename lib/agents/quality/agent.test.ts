import { describe, expect, it } from "vitest";

import { QualityAgent } from "./agent";
import type {
    FactoryState,
    Incident,
    Machine,
    ProductionOrder,
} from "@/types/factory";

const incident: Incident = {
    id: "INC-001",
    machineId: "M-02",
    status: "OPEN",
    severity: "HIGH",
    detectedAt: "2026-09-23T00:00:00.000Z",
    updatedAt: "2026-09-23T00:00:00.000Z",
    trigger: {
        anomalyScore: 0.72,
        signals: [
            {
                metric: "vibration",
                value: 7.1,
                baseline: 3.1,
                deviationPercent: 129,
                score: 0.84,
                message: "Vibration above baseline",
            },
            {
                metric: "defectRate",
                value: 1.6,
                baseline: 1.1,
                deviationPercent: 45.5,
                score: 0.04,
                message: "Defect rate above baseline",
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
        temperature: 78,
        vibration: 7.1,
        motorCurrent: 42,
        pressure: 118,
        outputRate: 110,
        defectRate: 1.6,
    },
};

const order: ProductionOrder = {
    id: "ORD-428",
    product: "Product Alpha",
    targetUnits: 5000,
    completedUnits: 2920,
    assignedMachineId: "M-02",
    deadline: "2026-09-23T04:00:00.000Z",
    status: "IN_PROGRESS",
};

const factoryState: FactoryState = {
    timestamp: "2026-09-23T00:00:00.000Z",
    machines: [machine],
    orders: [order],
    totalOutput: 110,
    averageUtilization: 92,
    anomalies: [],
    incidents: [incident],
};

describe("QualityAgent", () => {
    it("assesses elevated defect risk for the affected production order", async () => {
        const agent = new QualityAgent();
        const result = await agent.assessImpact(incident, factoryState);

        expect(result.incidentId).toBe("INC-001");
        expect(result.machineId).toBe("M-02");
        expect(result.orderId).toBe("ORD-428");
        expect(result.overallQualityRisk).toBe("HIGH");
        expect(result.dispositionRecommendation).toBe("HOLD_FOR_INSPECTION");
        expect(result.evidence).toEqual(expect.arrayContaining([expect.objectContaining({ metric: "defectRate" })]));
        expect(result.provider).toBe("mock");
    });
});