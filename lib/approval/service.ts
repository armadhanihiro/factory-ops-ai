import type {
    ApprovalRequestResult,
    RecoveryApproval,
} from "@/types/approval";
import type { FactoryState } from "@/types/factory";

import { getOrCreateDecisionSupport } from "@/lib/agents/decision-support/service";
import { analyzeIncidentRecovery } from "@/lib/recovery/analysis-service";

import { checkApprovalEligibility } from "./eligibility";
import {
    getRecoveryApproval,
    getRecoveryApprovalByIncident,
    saveRecoveryApproval,
} from "./store";

function createApprovalId(incidentId: string): string {
    return `APPROVAL-${incidentId}`;
}

export async function requestRecoveryApproval(incidentId: string, planId: string, factoryState: FactoryState): Promise<ApprovalRequestResult> {
    const existing = getRecoveryApprovalByIncident(incidentId);

    if (existing) {
        throw new Error(`Incident ${incidentId} already has an approval request`);
    }

    const analysis = await analyzeIncidentRecovery(incidentId, factoryState);
    const plan = analysis.plans.find((item) => item.id === planId);

    if (!plan) {
        throw new Error(`Recovery plan ${planId} does not exist`);
    }

    const eligibility = checkApprovalEligibility(planId, analysis);
    
    if (!eligibility.eligible) {
        return {
            approval: null,
            eligibleForApproval: false,
            blockingReasons: eligibility.blockingReasons,
        };
    }

    const decisionSupport = await getOrCreateDecisionSupport(incidentId, factoryState);

    const approval: RecoveryApproval = {
        id: createApprovalId(incidentId),
        incidentId,
        planId,
        planSnapshot: structuredClone(plan),
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        decidedAt: null,
        supervisorNote: null,
        recoveryAnalyzedAt: analysis.analyzedAt,
        decisionSupportGeneratedAt: decisionSupport.generatedAt,
    };

    saveRecoveryApproval(approval);

    return {
        approval,
        eligibleForApproval: true,
        blockingReasons: [],
    };
}

export function approveRecoveryPlan(approvalId: string, supervisorNote?: string): RecoveryApproval {
    const approval = getRecoveryApproval(approvalId);

    if (!approval) {
        throw new Error(`Approval ${approvalId} does not exist`);
    }

    if (approval.status !== "PENDING") {
        throw new Error(`Approval ${approvalId} is already ${approval.status}`);
    }

    const updated: RecoveryApproval = {
        ...approval,
        status: "APPROVED",
        decidedAt: new Date().toISOString(),
        supervisorNote: supervisorNote?.trim() || null,
    };

    saveRecoveryApproval(updated);

    return updated;
}

export function rejectRecoveryPlan(approvalId: string, supervisorNote?: string): RecoveryApproval {
    const approval = getRecoveryApproval(approvalId);

    if (!approval) {
        throw new Error(`Approval ${approvalId} does not exist`);
    }

    if (approval.status !== "PENDING") {
        throw new Error(`Approval ${approvalId} is already ${approval.status}`);
    }

    const updated: RecoveryApproval = {
        ...approval,
        status: "REJECTED",
        decidedAt: new Date().toISOString(),
        supervisorNote: supervisorNote?.trim() || null,
    };

    saveRecoveryApproval(updated);

    return updated;
}