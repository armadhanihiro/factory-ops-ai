import { describe, expect, it } from "vitest";

import type { ProductionContext } from "./types";
import { buildProductionFacts } from "./production-facts";

function createContext(): ProductionContext {
    return {
        incident: {
            id: "INC-001",
            machineId: "M-02",
            status: "INVESTIGATING",
            severity: "HIGH",
            detectedAt: "2026-09-25T10:00:00.000Z",
            updatedAt: "2026-09-25T10:00:00.000Z",
            trigger: {
                anomalyScore: 0.89,
                signals: [],
            },
        },
        affectedMachine: {
            id: "M-02",
            name: "Extruder A",
            type: "EXTRUDER",
            status: "WARNING",
            capacity: 120,
            currentOrderId: "ORD-428",
            telemetry: {
                machineId: "M-02",
                timestamp: "2026-09-25T10:00:00.000Z",
                temperature: 80,
                vibration: 7.3,
                motorCurrent: 42,
                pressure: 118,
                outputRate: 110,
                defectRate: 1.5,
            },
        },
        affectedOrder: {
            id: "ORD-428",
            product: "Product Alpha",
            targetUnits: 5000,
            completedUnits: 2920,
            assignedMachineId: "M-02",
            deadline: "2026-09-25T14:00:00.000Z",
            status: "AT_RISK",
        },
        remainingUnits: 2080,
        compatibleMachines: [
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
        ],
        qualityAssessment: {} as ProductionContext["qualityAssessment"],
        maintenanceAssessment: {} as ProductionContext["maintenanceAssessment"],
    };
}

describe("buildProductionFacts", () => {
    it("preserves deterministic order quantities", () => {
        const facts = buildProductionFacts(createContext());

        expect(facts.targetUnits).toBe(5000);
        expect(facts.completedUnits).toBe(2920);
        expect(facts.remainingUnits).toBe(2080);
    });

    it("marks the affected production as at risk", () => {
        const facts = buildProductionFacts(createContext());

        expect(facts.productionAtRisk).toBe(true);
    });

    it("exposes M-03 as an available alternative", () => {
        const facts = buildProductionFacts(createContext());

        expect(facts.alternatives).toContainEqual({
            machineId: "M-03",
            status: "IDLE",
            capacity: 100,
            available: true,
        });
    });

    it("does not treat a running compatible machine as available", () => {
        const context = createContext();
        context.compatibleMachines[0].status = "RUNNING";
        const facts = buildProductionFacts(context);

        expect(facts.alternatives[0].available).toBe(false);
    });
});