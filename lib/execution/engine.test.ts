import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import type { RecoveryApproval } from "@/types/approval";
import type { FactoryState } from "@/types/factory";
import type { RecoveryPlan } from "@/types/recovery";

import { resetFactory } from "@/lib/simulator/store";

vi.mock("./pre-execution-validator", () => ({
    validateBeforeExecution: vi.fn(),
}));

import { validateBeforeExecution } from "./pre-execution-validator";
import { executeApprovedRecoveryPlan } from "./engine";

const mockedValidateBeforeExecution = vi.mocked(validateBeforeExecution);

function createPlan(): RecoveryPlan {
    return {
        id: "RECOVERY-TEST-1",
        name: "Safe recovery",
        description: "Test recovery plan",
        incidentId: "INC-TEST",
        machineId: "M-02",
        actions: [
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
        ],
        rationale: "Test atomic recovery execution",
    };
}

function createApproval(plan: RecoveryPlan): RecoveryApproval {
    return {
        id: "APPROVAL-INC-TEST",
        incidentId: plan.incidentId,
        planId: plan.id,
        planSnapshot: structuredClone(plan),
        status: "APPROVED",
        requestedAt: "2026-10-01T00:00:00.000Z",
        decidedAt: "2026-10-01T00:01:00.000Z",
        supervisorNote: null,
        recoveryAnalyzedAt: "2026-10-01T00:00:00.000Z",
        decisionSupportGeneratedAt: "2026-10-01T00:00:00.000Z",
    };
}

describe("executeApprovedRecoveryPlan", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("executes every action against a working-state clone", async () => {
        mockedValidateBeforeExecution.mockResolvedValue({
            valid: true,
            blockingReasons: [],
        });

        const state = resetFactory();
        const plan = createPlan();
        const approval = createApproval(plan);
        const originalState = structuredClone(state);
        const result = await executeApprovedRecoveryPlan(approval, plan, state);

        expect(result.executed).toBe(true);
        expect(result.execution).not.toBeNull();
        expect(result.execution?.status).toBe("COMPLETED");
        expect(result.execution?.actionResults).toHaveLength(2);

        const resultingMachine = result.factoryState.machines.find((machine) => machine.id === "M-02",);

        expect(resultingMachine?.status).toBe("MAINTENANCE");
        expect(state).toEqual(originalState);
    });

    it("does not execute when pre-execution validation fails", async () => {
        mockedValidateBeforeExecution.mockResolvedValue({
            valid: false,
            blockingReasons: ["Current-state constraint"],
        });

        const state = resetFactory();
        const plan = createPlan();
        const approval = createApproval(plan);
        const originalState = structuredClone(state);
        const result = await executeApprovedRecoveryPlan(approval, plan, state);

        expect(result.executed).toBe(false);
        expect(result.execution).toBeNull();
        expect(result.factoryState).toEqual(originalState);
        expect(result.blockingReasons).toContain("Current-state constraint");
    });

    it("rolls back the complete working state when an action fails", async () => {
        mockedValidateBeforeExecution.mockResolvedValue({
            valid: true,
            blockingReasons: [],
        });

        const state = resetFactory();
        const plan: RecoveryPlan = {
            ...createPlan(),
            actions: [
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "This action succeeds first",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId: "UNKNOWN-MACHINE",
                    reasoning: "This action must fail",
                },
            ],
        };

        const approval = createApproval(plan);
        const originalState = structuredClone(state);
        const result = await executeApprovedRecoveryPlan(approval, plan, state);

        expect(result.executed).toBe(false);
        expect(result.execution).toBeNull();
        expect(result.factoryState).toEqual(originalState);
        expect(state).toEqual(originalState);
        expect(result.blockingReasons[0]).toContain("Execution blocked:");
    });
});
