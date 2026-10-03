import {
    describe,
    expect,
    it,
} from "vitest";

import type { RecoveryExecution } from "@/types/execution";
import type {
    RecoveryPlan,
    RecoverySimulationOutcome,
} from "@/types/recovery";

import { getFactoryState } from "@/lib/simulator/store";

import { evaluateRecoveryExecution } from "./evaluator";

function createPlan(): RecoveryPlan {
    return {
        id: "RECOVERY-TEST-1",
        name: "Immediate halt and inspection",
        description: "Pause, inspect, and hold affected output",
        incidentId: "INC-TEST",
        machineId: "M-02",
        actions: [
            {
                type: "PAUSE_MACHINE",
                machineId: "M-02",
                reasoning: "Stop production on affected machine",
            },
            {
                type: "INSPECT_MACHINE",
                machineId: "M-02",
                reasoning: "Inspect affected machine",
            },
            {
                type: "HOLD_OUTPUT",
                orderId: "ORD-428",
                reasoning: "Hold potentially affected output",
            },
        ],
        rationale: "Protect equipment and product quality",
    };
}

function createPrediction(): RecoverySimulationOutcome {
    return {
        planId: "RECOVERY-TEST-1",
        feasible: true,
        constraintViolations: [],
        productionMachineId: null,
        productionCapacityPerHour: 0,
        remainingUnits: 2080,
        estimatedProductionHours: null,
        estimatedInterventionMinutes: null,
        estimatedTotalRecoveryMinutes: null,
        qualityHoldRequired: true,
        machineInspectionRequired: true,
        calculatedAt: "2026-10-03T00:00:00.000Z",
    };
}

function createSuccessfulExecution(): RecoveryExecution {
    const before = structuredClone(getFactoryState());
    const after = structuredClone(before);
    const machine = after.machines.find((item) => item.id === "M-02");
    const order = after.orders.find((item) => item.id === "ORD-428");

    if (!machine || !order) {
        throw new Error("Required test factory resources do not exist");
    }

    machine.status = "MAINTENANCE";
    order.status = "AT_RISK";

    return {
        id: "EXECUTION-TEST-1",
        approvalId: "APPROVAL-TEST-1",
        incidentId: "INC-TEST",
        planId: "RECOVERY-TEST-1",
        status: "COMPLETED",
        actionResults: [
            {
                actionIndex: 0,
                action: {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "Stop production",
                },
                status: "EXECUTED",
                message: "Machine paused",
                executedAt: "2026-10-03T00:01:00.000Z",
            },
            {
                actionIndex: 1,
                action: {
                    type: "INSPECT_MACHINE",
                    machineId: "M-02",
                    reasoning: "Inspect machine",
                },
                status: "EXECUTED",
                message: "Machine moved to maintenance",
                executedAt: "2026-10-03T00:01:01.000Z",
            },
            {
                actionIndex: 2,
                action: {
                    type: "HOLD_OUTPUT",
                    orderId: "ORD-428",
                    reasoning: "Hold output",
                },
                status: "EXECUTED",
                message: "Output held",
                executedAt: "2026-10-03T00:01:02.000Z",
            },
        ],
        predictionSnapshot: createPrediction(),
        factoryStateBefore: before,
        factoryStateAfter: after,
        startedAt: "2026-10-03T00:01:00.000Z",
        completedAt: "2026-10-03T00:01:03.000Z",
    };
}

describe("evaluateRecoveryExecution", () => {
    it("verifies fully achieved recovery actions", () => {
        const result = evaluateRecoveryExecution(createSuccessfulExecution(), createPlan());

        expect(result.outcome).toBe("RECOVERY_ACTIONS_ACHIEVED");
        expect(result.expectedActions).toBe(3);
        expect(result.achievedActions).toBe(3);
        expect(result.actionEvaluations.every((item) => item.achieved)).toBe(true);
        expect(result.predictionComparison).toMatchObject({
            expectedProductionMachineId: null,
            actualProductionMachineId: null,
            expectedQualityHold: true,
            actualQualityHold: true,
            expectedInspection: true,
            actualInspection: true,
        });
        expect(result.predictionComparison.matchedPredictions).toBe(3);
        expect(result.predictionComparison.totalPredictions).toBe(3);
        expect(result.predictionComparison.productionMachineMatched).toBe(true);
        expect(result.predictionComparison.qualityHoldMatched).toBe(true);
        expect(result.predictionComparison.inspectionMatched).toBe(true);
    });

    it("detects state mismatch even when an action reports EXECUTED", () => {
        const execution = createSuccessfulExecution();
        const machine = execution.factoryStateAfter.machines.find((item) => item.id === "M-02");

        if (!machine) {
            throw new Error("Test machine M-02 does not exist");
        }

        machine.status = "RUNNING";

        const result = evaluateRecoveryExecution(execution, createPlan());

        expect(result.outcome).toBe("RECOVERY_ACTIONS_PARTIALLY_ACHIEVED");
        expect(result.achievedActions).toBe(1);

        const pauseEvaluation = result.actionEvaluations.find((item) => item.actionType === "PAUSE_MACHINE");
        const inspectionEvaluation = result.actionEvaluations.find((item) => item.actionType === "INSPECT_MACHINE");

        expect(pauseEvaluation?.achieved).toBe(false);
        expect(inspectionEvaluation?.achieved).toBe(false);
        expect(result.predictionComparison.actualInspection).toBe(false);
        expect(result.predictionComparison.productionMachineMatched).toBe(false);
        expect(result.predictionComparison.inspectionMatched).toBe(false);
        expect(result.predictionComparison.qualityHoldMatched).toBe(true);
        expect(result.predictionComparison.matchedPredictions).toBe(1);
        expect(result.predictionComparison.totalPredictions).toBe(3);
    });

    it("surfaces a mismatch between prediction and actual state", () => {
        const execution = createSuccessfulExecution();
        execution.predictionSnapshot.productionMachineId = "M-03";
        const result = evaluateRecoveryExecution(execution, createPlan());
        
        expect(result.predictionComparison.expectedProductionMachineId).toBe("M-03");
        expect(result.predictionComparison.actualProductionMachineId).toBeNull();
        expect(result.predictionComparison.productionMachineMatched).toBe(false);
        expect(result.predictionComparison.qualityHoldMatched).toBe(true);
        expect(result.predictionComparison.inspectionMatched).toBe(true);
        expect(result.predictionComparison.matchedPredictions).toBe(2);
        expect(result.predictionComparison.totalPredictions).toBe(3);
        expect(result.outcome).toBe("RECOVERY_ACTIONS_ACHIEVED");
    });
});