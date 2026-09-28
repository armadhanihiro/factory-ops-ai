export type ApprovalStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export interface RecoveryApproval {
    id: string;
    incidentId: string;
    planId: string;
    status: ApprovalStatus;
    requestedAt: string;
    decidedAt: string | null;
    supervisorNote: string | null;

    /*
     * Snapshot identifiers used to make sure
     * approval refers to the exact recovery
     * analysis that was presented.
     */
    recoveryAnalyzedAt: string;
    decisionSupportGeneratedAt: string;
}

export interface ApprovalRequestResult {
    approval: RecoveryApproval | null;
    eligibleForApproval: boolean;
    blockingReasons: string[];
}