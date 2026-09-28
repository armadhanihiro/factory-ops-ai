import { describe, expect, it } from "vitest";

import type { RecoveryAnalysisResult } from "@/types/recovery";

import { checkApprovalEligibility } from "./eligibility";

function createAnalysis(
    options: {
        compliant?: boolean;
        feasible?: boolean;
    } = {},
): RecoveryAnalysisResult {
    const {
        compliant = true,
        feasible = true,
    } = options;

    return {
        incidentId: "INC-001",
        incidentSeverity: "HIGH",
        plans: [
            {
                id: "RECOVERY-INC-001-1",
                name: "Test recovery plan",
                description: "Test plan",
                incidentId: "INC-001",
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
                rationale: "Test rationale",
            },
        ],
        policyValidations: [
            {
                planId: "RECOVERY-INC-001-1",
                compliant,
                violations: compliant ? [] : ["CONTINUE_PRODUCTION conflicts with IMMEDIATE_INSPECTION_RECOMMENDED"],
            },
        ],
        simulation: {
            incidentId: "INC-001",
            incidentSeverity: "HIGH",
            outcomes: [
                {
                    planId: "RECOVERY-INC-001-1",
                    feasible,
                    constraintViolations: feasible ? [] : ["Target machine is not available"],
                    productionMachineId: "M-03",
                    productionCapacityPerHour: 100,
                    remainingUnits: 2080,
                    estimatedProductionHours: 20.8,
                    estimatedInterventionMinutes: null,
                    estimatedTotalRecoveryMinutes: null,
                    qualityHoldRequired: true,
                    machineInspectionRequired: true,
                    calculatedAt: "2026-09-28T00:00:00.000Z",
                },
            ],
            simulatedAt: "2026-09-28T00:00:00.000Z",
        },
        analyzedAt: "2026-09-28T00:00:00.000Z",
    };
}

describe("checkApprovalEligibility", () => {
    it("allows a feasible and policy-compliant plan", () => {
        const analysis = createAnalysis();
        const result = checkApprovalEligibility("RECOVERY-INC-001-1", analysis);

        expect(result.eligible).toBe(true);
        expect(result.blockingReasons).toEqual([]);
    });

    it("blocks a plan with a policy conflict", () => {
        const analysis = createAnalysis({
            compliant: false,
        });

        const result = checkApprovalEligibility("RECOVERY-INC-001-1", analysis,);

        expect(result.eligible).toBe(false);
        expect(result.blockingReasons).toContain("Policy conflict: CONTINUE_PRODUCTION conflicts with IMMEDIATE_INSPECTION_RECOMMENDED");
    });

    it("blocks a structurally infeasible plan", () => {
        const analysis = createAnalysis({
            feasible: false,
        });

        const result = checkApprovalEligibility("RECOVERY-INC-001-1", analysis);

        expect(result.eligible).toBe(false);
        expect(result.blockingReasons).toContain("Simulation constraint: Target machine is not available");
    });

    it("blocks an unknown recovery plan", () => {
        const analysis = createAnalysis();
        const result = checkApprovalEligibility("RECOVERY-DOES-NOT-EXIST", analysis);

        expect(result.eligible).toBe(false);
        expect(result.blockingReasons).toContain("Recovery plan RECOVERY-DOES-NOT-EXIST does not exist");
    });
});