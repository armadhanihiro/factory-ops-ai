import type { RecoveryPlan } from "@/types/recovery";

export type ApprovalStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface RecoveryApproval {
    id: string;
    incidentId: string;
    planId: string;

    /*
     * Immutable snapshot of the exact recovery plan
     * presented to and approved by the supervisor.
     */
    planSnapshot: RecoveryPlan;
    status: ApprovalStatus;
    requestedAt: string;
    decidedAt: string | null;
    supervisorNote: string | null;

    /*
     * References to the analysis and decision-support
     * outputs presented during approval.
     */
    recoveryAnalyzedAt: string;
    decisionSupportGeneratedAt: string;
}

export interface ApprovalRequestResult {
    approval: RecoveryApproval | null;
    eligibleForApproval: boolean;
    blockingReasons: string[];
}