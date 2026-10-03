import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type { RecoveryApproval } from "@/types/approval";
import type { RecoveryExecution } from "@/types/execution";
import type { RecoveryEvaluation } from "@/types/recovery-evaluation";
import type { RecoveryPlan } from "@/types/recovery";

import {
    clearRecoveryApprovals,
    saveRecoveryApproval,
} from "@/lib/approval/store";
import {
    clearRecoveryExecutions,
    saveRecoveryExecution,
} from "@/lib/execution/store";

import {
    clearRecoveryEvaluations,
    getRecoveryEvaluationByExecution,
} from "./store";

vi.mock("./evaluator", () => ({
    evaluateRecoveryExecution: vi.fn(),
}));

import { evaluateRecoveryExecution } from "./evaluator";
import { evaluateRecoveryExecutionById } from "./service";

const mockedEvaluateRecoveryExecution = vi.mocked(evaluateRecoveryExecution);

function createPlan(): RecoveryPlan {
    return {
        id: "RECOVERY-TEST-1",
        name: "Test Recovery",
        description: "Test recovery evaluation",
        incidentId: "INC-TEST",
        machineId: "M-02",
        actions: [],
        rationale: "Test",
    };
}

function createApproval(plan: RecoveryPlan): RecoveryApproval {
    return {
        id: "APPROVAL-TEST-1",
        incidentId: plan.incidentId,
        planId: plan.id,
        planSnapshot: structuredClone(plan),
        status: "APPROVED",
        requestedAt: "2026-10-03T00:00:00.000Z",
        decidedAt: "2026-10-03T00:01:00.000Z",
        supervisorNote: null,
        recoveryAnalyzedAt: "2026-10-03T00:00:00.000Z",
        decisionSupportGeneratedAt: "2026-10-03T00:00:00.000Z",
    };
}

function createExecution(approval: RecoveryApproval): RecoveryExecution {
    return {
        id: "EXECUTION-TEST-1",
        approvalId: approval.id,
        incidentId: approval.incidentId,
        planId: approval.planId,
        status: "COMPLETED",
        actionResults: [],
        predictionSnapshot: {
            planId: approval.planId,
            feasible: true,
            constraintViolations: [],
            productionMachineId: null,
            productionCapacityPerHour: 0,
            remainingUnits: 0,
            estimatedProductionHours: null,
            estimatedInterventionMinutes: null,
            estimatedTotalRecoveryMinutes: null,
            qualityHoldRequired: false,
            machineInspectionRequired: false,
            calculatedAt: "2026-10-03T00:01:30.000Z",
        },
        factoryStateBefore: {} as RecoveryExecution["factoryStateBefore"],
        factoryStateAfter: {} as RecoveryExecution["factoryStateAfter"],
        startedAt: "2026-10-03T00:02:00.000Z",
        completedAt: "2026-10-03T00:02:01.000Z",
    };
}

function createEvaluation(execution: RecoveryExecution): RecoveryEvaluation {
    return {
        id: `EVALUATION-${execution.id}`,
        executionId: execution.id,
        incidentId: execution.incidentId,
        planId: execution.planId,
        expectedActions: 0,
        achievedActions: 0,
        actionEvaluations: [],
        predictionComparison: {
            expectedProductionMachineId: null,
            actualProductionMachineId: null,
            productionMachineMatched: true,
            expectedQualityHold: false,
            actualQualityHold: false,
            qualityHoldMatched: true,
            expectedInspection: false,
            actualInspection: false,
            inspectionMatched: true,
            matchedPredictions: 3,
            totalPredictions: 3,
        },
        outcome: "RECOVERY_ACTIONS_FAILED",
        evaluatedAt: "2026-10-03T00:03:00.000Z",
    };
}

describe("evaluateRecoveryExecutionById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearRecoveryApprovals();
        clearRecoveryExecutions();
        clearRecoveryEvaluations();
    });

    it("evaluates and stores a completed execution", () => {
        const plan = createPlan();
        const approval = createApproval(plan);
        const execution = createExecution(approval);
        const expected = createEvaluation(execution);

        saveRecoveryApproval(approval);
        saveRecoveryExecution(execution);

        mockedEvaluateRecoveryExecution.mockReturnValue(expected);

        const result = evaluateRecoveryExecutionById(execution.id);

        expect(result).toEqual(expected);
        expect(getRecoveryEvaluationByExecution(execution.id)).toEqual(expected);
        expect(mockedEvaluateRecoveryExecution).toHaveBeenCalledTimes(1);
    });

    it("returns the existing evaluation for the same execution", () => {
        const plan = createPlan();
        const approval = createApproval(plan);
        const execution = createExecution(approval);
        const expected = createEvaluation(execution);

        saveRecoveryApproval(approval);
        saveRecoveryExecution(execution);

        mockedEvaluateRecoveryExecution.mockReturnValue(expected);

        const first = evaluateRecoveryExecutionById(execution.id);
        const second = evaluateRecoveryExecutionById(execution.id);

        expect(second).toEqual(first);
        expect(mockedEvaluateRecoveryExecution).toHaveBeenCalledTimes(1);
    });

    it("rejects an unknown execution", () => {
        expect(() => evaluateRecoveryExecutionById("EXECUTION-UNKNOWN")).toThrow("Execution EXECUTION-UNKNOWN does not exist");
    });
});