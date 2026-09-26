import { describe, expect, it } from "vitest";

import type {
    FactoryState,
    Incident,
    Machine,
    ProductionOrder,
} from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";
import type { QualityAssessment } from "@/types/quality";

import { buildProductionContext } from "./context";

const incident: Incident = {
    id: "INC-001",
    machineId: "M-02",
    status: "INVESTIGATING",
    severity: "HIGH",
    detectedAt: "2026-09-25T10:00:00.000Z",
    updatedAt: "2026-09-25T10:00:00.000Z",
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
        ],
    },
};

const machines: Machine[] = [
    {
        id: "M-02",
        name: "Extruder A",
        type: "EXTRUDER",
        status: "WARNING",
        capacity: 120,
        currentOrderId: "ORD-428",
        telemetry: {
            machineId: "M-02",
            timestamp: "2026-09-25T10:00:00.000Z",
            temperature: 80.7,
            vibration: 7.3,
            motorCurrent: 42,
            pressure: 118,
            outputRate: 110,
            defectRate: 1.54,
        },
    },
    {
        id: "M-03",
        name: "Extruder B",
        type: "EXTRUDER",
        status: "IDLE",
        capacity: 100,
        telemetry: {
            machineId: "M-03",
            timestamp: "2026-09-25T10:00:00.000Z",
            temperature: 68,
            vibration: 2.8,
            motorCurrent: 18,
            pressure: 110,
            outputRate: 0,
            defectRate: 0.8,
        },
    },
];

const orders: ProductionOrder[] = [
    {
        id: "ORD-428",
        product: "Product Alpha",
        targetUnits: 5000,
        completedUnits: 2920,
        assignedMachineId: "M-02",
        deadline: "2026-09-25T14:00:00.000Z",
        status: "AT_RISK",
    },
];

const factoryState: FactoryState = {
    timestamp: "2026-09-25T10:00:00.000Z",
    machines,
    orders,
    totalOutput: 110,
    averageUtilization: 50,
    anomalies: [],
    incidents: [incident],
};

const qualityAssessment: QualityAssessment = {
    incidentId: "INC-001",
    machineId: "M-02",
    orderId: "ORD-428",
    incidentSeverity: "HIGH",
    overallQualityRisk: "HIGH",
    risks: [
        {
            category: "Product quality",
            severity: "HIGH",
            reasoning: "Elevated defect rate requires inspection.",
        },
    ],
    evidence: [
        {
            metric: "defectRate",
            observation: "Defect rate is above baseline.",
            significance: "Potential product quality impact.",
        },
    ],

    recommendedInspections: ["Inspect affected production output."],
    dispositionRecommendation: "HOLD_FOR_INSPECTION",
    reasoning: "Quality risk should be assessed before continuing production.",
    generatedAt: "2026-09-25T10:01:00.000Z",
    provider: "gemini",
};

const maintenanceAssessment: MaintenanceAssessment = {
    incidentId: "INC-001",
    machineId: "M-02",
    incidentSeverity: "HIGH",
    urgency: "URGENT",
    suspectedFailureMode: "Mechanical Component Wear or Misalignment",
    evidence: [
        {
            source: "INCIDENT",
            observation: "Vibration is above baseline.",
            significance: "Indicates possible mechanical degradation.",
        },
    ],
    recommendedTasks: [
        {
            task: "Inspect rotating components",
            purpose: "Check for wear or misalignment.",
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
    reasoning: "Mechanical inspection is recommended due to elevated vibration.",
    generatedAt: "2026-09-25T10:02:00.000Z",
    provider: "gemini",
};

describe("buildProductionContext", () => {
    it("resolves the affected order from the machine", () => {
        const context = buildProductionContext("INC-001", factoryState, qualityAssessment, maintenanceAssessment);

        expect(context.affectedOrder?.id).toBe("ORD-428");
    });

    it("calculates remaining units deterministically", () => {
        const context = buildProductionContext("INC-001", factoryState, qualityAssessment, maintenanceAssessment);

        expect(context.remainingUnits).toBe(2080);
    });

    it("discovers M-03 as a compatible backup machine", () => {
        const context = buildProductionContext("INC-001", factoryState, qualityAssessment, maintenanceAssessment);

        expect(context.compatibleMachines.map((machine) => machine.id)).toContain("M-03");
    });

    it("rejects a quality assessment from another incident", () => {
        const mismatchedQuality: QualityAssessment = {
            ...qualityAssessment,
            incidentId: "INC-999",
        };

        expect(() => buildProductionContext(
            "INC-001",
            factoryState,
            mismatchedQuality,
            maintenanceAssessment,
        )).toThrow("Quality assessment does not match production incident");
    });

    it("rejects a maintenance assessment from another machine", () => {
        const mismatchedMaintenance: MaintenanceAssessment = {
            ...maintenanceAssessment,
            machineId: "M-03",
        };

        expect(() => buildProductionContext(
            "INC-001",
            factoryState,
            qualityAssessment,
            mismatchedMaintenance,
        )).toThrow("Maintenance assessment does not match production incident");
    });
});