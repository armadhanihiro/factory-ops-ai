import { describe, expect, it } from "vitest";

import type { RecoverySimulationContext } from "./types";
import type { RecoveryPlan } from "@/types/recovery";

import { RecoverySimulator } from "./simulator";

const context = {
    incident: {
        id: "INC-001",
        machineId: "M-02",
        severity: "HIGH",
    },
    analysis: {
        production: {
            remainingUnits: 2080,
            currentMachineCapacity: 120,
            alternatives: [
                {
                    machineId: "M-03",
                    available: true,
                    capacity: 100,
                    reasoning: "Verified backup machine",
                },
            ],
        },
        maintenance: {
            estimatedInterventionMinutes: null,
        },
    },
} as RecoverySimulationContext;

function plan(id: string, actions: RecoveryPlan["actions"]): RecoveryPlan {
    return {
        id,
        name: id,
        description: id,
        incidentId: "INC-001",
        machineId: "M-02",
        actions,
        rationale: "Test plan",
    };
}

describe("RecoverySimulator", () => {
    const simulator = new RecoverySimulator();

    it("calculates production time on the current machine", () => {
        const result = simulator.simulate(
            [
                plan("PLAN-A", [
                    {
                        type: "CONTINUE_PRODUCTION",
                        machineId: "M-02",
                        orderId: "ORD-428",
                        reasoning: "Continue production",
                    },
                ]),
            ],
            context,
        );

        const outcome = result.outcomes[0];

        expect(outcome.feasible).toBe(true);
        expect(outcome.productionMachineId).toBe("M-02");
        expect(outcome.productionCapacityPerHour).toBe(120);
        expect(outcome.estimatedProductionHours).toBeCloseTo(17.3333, 3);
    });

    it("returns unknown production completion when production is paused without rerouting", () => {
        const result = simulator.simulate(
            [
                plan("PLAN-B", [
                    {
                        type: "PAUSE_MACHINE",
                        machineId: "M-02",
                        reasoning: "Pause machine",
                    },
                    {
                        type: "INSPECT_MACHINE",
                        machineId: "M-02",
                        reasoning: "Inspect machine",
                    },
                ]),
            ],
            context,
        );

        const outcome = result.outcomes[0];

        expect(outcome.feasible).toBe(true);
        expect(outcome.productionMachineId).toBeNull();
        expect(outcome.productionCapacityPerHour).toBe(0);
        expect(outcome.estimatedProductionHours).toBeNull();
        expect(outcome.estimatedInterventionMinutes).toBeNull();
        expect(outcome.estimatedTotalRecoveryMinutes).toBeNull();
    });

    it("calculates rerouted production time using verified alternative capacity", () => {
        const result = simulator.simulate(
            [
                plan("PLAN-C", [
                    {
                        type: "PAUSE_MACHINE",
                        machineId: "M-02",
                        reasoning: "Pause affected machine",
                    },
                    {
                        type: "INSPECT_MACHINE",
                        machineId: "M-02",
                        reasoning: "Inspect affected machine",
                    },
                    {
                        type: "REROUTE_ORDER",
                        machineId: "M-02",
                        orderId: "ORD-428",
                        targetMachineId: "M-03",
                        reasoning: "Use backup capacity",
                    },
                ]),
            ],
            context,
        );

        const outcome = result.outcomes[0];

        expect(outcome.feasible).toBe(true);
        expect(outcome.productionMachineId).toBe("M-03");
        expect(outcome.productionCapacityPerHour).toBe(100);
        expect(outcome.estimatedProductionHours).toBeCloseTo(20.8, 3);

        // Production estimate is known,
        // but full recovery duration is not.
        expect(outcome.estimatedTotalRecoveryMinutes).toBeNull();
    });

    it("rejects rerouting to an unverified machine", () => {
        const result = simulator.simulate(
            [
                plan("INVALID", [
                    {
                        type: "REROUTE_ORDER",
                        machineId: "M-02",
                        orderId: "ORD-428",
                        targetMachineId: "M-99",
                        reasoning: "Invalid reroute",
                    },
                ]),
            ],
            context,
        );

        const outcome = result.outcomes[0];

        expect(outcome.feasible).toBe(false);
        expect(outcome.constraintViolations.length).toBeGreaterThan(0);
        expect(outcome.productionMachineId).toBeNull();
    });

    it("rejects contradictory pause and continue actions", () => {
        const result = simulator.simulate(
            [
                plan("CONTRADICTORY", [
                    {
                        type: "PAUSE_MACHINE",
                        machineId: "M-02",
                        reasoning: "Pause",
                    },
                    {
                        type: "CONTINUE_PRODUCTION",
                        machineId: "M-02",
                        reasoning: "Continue",
                    },
                ]),
            ],
            context,
        );

        expect(result.outcomes[0].feasible).toBe(false);
    });
});