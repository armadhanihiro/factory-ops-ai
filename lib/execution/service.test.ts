import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type { RecoveryApproval } from "@/types/approval";
import type { RecoveryExecution } from "@/types/execution";
import type { RecoveryPlan } from "@/types/recovery";

import {
    clearRecoveryApprovals,
    saveRecoveryApproval,
} from "@/lib/approval/store";

import {
    getFactoryState,
    resetFactory,
} from "@/lib/simulator/store";

import {
    clearRecoveryExecutions,
    saveRecoveryExecution,
} from "./store";

vi.mock("./engine", async () => {
    const actual = await vi.importActual<typeof import("./engine")>("./engine");

    return {
        ...actual,
        executeApprovedRecoveryPlan: vi.fn(),
    };
});

import {
    executeApprovedRecoveryPlan,
} from "./engine";

import {
    executeRecoveryApproval,
} from "./service";

const mockedExecuteApprovedRecoveryPlan = vi.mocked(executeApprovedRecoveryPlan);

function createPlan(): RecoveryPlan {
    return {
        id: "RECOVERY-TEST-1",
        name: "Test Recovery",
        description: "Approved recovery plan",
        incidentId: "INC-TEST",
        machineId: "M-02",
        actions: [
            {
                type: "PAUSE_MACHINE",
                machineId: "M-02",
                reasoning: "Pause affected machine",
            },
        ],
        rationale: "Test execution service",
    };
}

function createApproval(status: RecoveryApproval["status"] = "APPROVED"): RecoveryApproval {
    const plan = createPlan();

    return {
        id: "APPROVAL-INC-TEST",
        incidentId: plan.incidentId,
        planId: plan.id,
        planSnapshot: structuredClone(plan),
        status,
        requestedAt: "2026-10-01T00:00:00.000Z",
        decidedAt: status === "PENDING" ? null : "2026-10-01T00:01:00.000Z",
        supervisorNote: null,
        recoveryAnalyzedAt: "2026-10-01T00:00:00.000Z",
        decisionSupportGeneratedAt: "2026-10-01T00:00:00.000Z",
    };
}

describe("executeRecoveryApproval", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearRecoveryApprovals();
        clearRecoveryExecutions();
        resetFactory();
    });

    it("commits factory state after successful execution", async () => {
        const approval = createApproval();
        saveRecoveryApproval(approval);
        const before = structuredClone(getFactoryState());
        const resultingState = structuredClone(before);
        const machine = resultingState.machines.find((item) => item.id === "M-02");

        if (!machine) {
            throw new Error("Test machine M-02 does not exist");
        }

        machine.status = "IDLE";

        const execution: RecoveryExecution = {
            id: `EXECUTION-${approval.id}`,
            approvalId: approval.id,
            incidentId: approval.incidentId,
            planId: approval.planId,
            status: "COMPLETED",
            actionResults: [],
            startedAt: "2026-10-01T00:02:00.000Z",
            completedAt: "2026-10-01T00:02:01.000Z",
        };

        mockedExecuteApprovedRecoveryPlan.mockResolvedValue({
            execution,
            factoryState: resultingState,
            executed: true,
            blockingReasons: [],
        });

        const result = await executeRecoveryApproval(approval.id);

        expect(result.executed).toBe(true);
        expect(getFactoryState().machines.find((item) => item.id === "M-02")?.status).toBe("IDLE");
    });

    it("does not commit factory state when execution is blocked", async () => {
        const approval = createApproval();
        saveRecoveryApproval(approval);
        const before = structuredClone(getFactoryState());

        mockedExecuteApprovedRecoveryPlan.mockResolvedValue({
            execution: null,
            factoryState: before,
            executed: false,
            blockingReasons: ["Current-state constraint"],
        });

        const result = await executeRecoveryApproval(approval.id);

        expect(result.executed).toBe(false);
        expect(getFactoryState()).toEqual(before);
    });

    it("rejects execution without APPROVED status", async () => {
        const approval = createApproval("PENDING");
        saveRecoveryApproval(approval);

        await expect(executeRecoveryApproval(approval.id)).rejects.toThrow("is not APPROVED");
        expect(mockedExecuteApprovedRecoveryPlan).not.toHaveBeenCalled();
    });

    it("prevents the same approval from executing twice", async () => {
        const approval = createApproval();
        saveRecoveryApproval(approval);
        const existingExecution:
            RecoveryExecution = {
                id: `EXECUTION-${approval.id}`,
                approvalId: approval.id,
                incidentId: approval.incidentId,
                planId: approval.planId,
                status: "COMPLETED",
                actionResults: [],
                startedAt: "2026-10-01T00:02:00.000Z",
                completedAt: "2026-10-01T00:02:01.000Z",
            };

        saveRecoveryExecution(existingExecution);

        await expect(executeRecoveryApproval(approval.id)).rejects.toThrow("has already been executed");
        expect(mockedExecuteApprovedRecoveryPlan).not.toHaveBeenCalled();
    });
});