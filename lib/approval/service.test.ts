import {
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import type { RecoveryApproval } from "@/types/approval";

import {
    approveRecoveryPlan,
    rejectRecoveryPlan,
} from "./service";
import {
    clearRecoveryApprovals,
    saveRecoveryApproval,
} from "./store";

function createPendingApproval(): RecoveryApproval {
    return {
        id: "APPROVAL-INC-001",
        incidentId: "INC-001",
        planId: "RECOVERY-INC-001-1",
        planSnapshot: {
            id: "RECOVERY-INC-001-1",
            name: "Test Recovery Plan",
            description: "Recovery plan used for approval workflow testing",
            incidentId: "INC-001",
            machineId: "M-02",
            actions: [
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "Pause the affected machine",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId: "M-02",
                    reasoning: "Inspect the affected machine",
                },
            ],
            rationale: "Test recovery plan for approval state transitions",
        },
        status: "PENDING",
        requestedAt: "2026-09-28T00:00:00.000Z",
        decidedAt: null,
        supervisorNote: null,
        recoveryAnalyzedAt: "2026-09-28T00:00:00.000Z",
        decisionSupportGeneratedAt: "2026-09-28T00:00:00.000Z",
    };
}

describe("recovery approval state machine", () => {
    beforeEach(() => {
        clearRecoveryApprovals();
    });

    it("approves a pending recovery approval", () => {
        saveRecoveryApproval(createPendingApproval());

        const result = approveRecoveryPlan("APPROVAL-INC-001", "Approved by supervisor");

        expect(result.status).toBe("APPROVED");
        expect(result.decidedAt).not.toBeNull();
        expect(result.supervisorNote).toBe("Approved by supervisor");
    });

    it("rejects a pending recovery approval", () => {
        saveRecoveryApproval(createPendingApproval());
        const result = rejectRecoveryPlan("APPROVAL-INC-001", "Use another recovery strategy");

        expect(result.status).toBe("REJECTED");
        expect(result.decidedAt).not.toBeNull();
    });

    it("does not allow an approved decision to change", () => {
        saveRecoveryApproval(createPendingApproval());
        approveRecoveryPlan("APPROVAL-INC-001");

        expect(() => rejectRecoveryPlan("APPROVAL-INC-001")).toThrow("Approval APPROVAL-INC-001 is already APPROVED");
        expect(() => approveRecoveryPlan("APPROVAL-INC-001")).toThrow("Approval APPROVAL-INC-001 is already APPROVED");
    });

    it("does not allow a rejected decision to change", () => {
        saveRecoveryApproval(createPendingApproval());
        rejectRecoveryPlan("APPROVAL-INC-001");

        expect(() => approveRecoveryPlan("APPROVAL-INC-001")).toThrow("Approval APPROVAL-INC-001 is already REJECTED");
    });
});