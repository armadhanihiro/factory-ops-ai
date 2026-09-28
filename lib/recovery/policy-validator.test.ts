import { describe, expect, it } from "vitest";

import type { CrossFunctionalAnalysis } from "@/types/orchestrator";
import type { RecoveryPlan } from "@/types/recovery";

import { RecoveryPolicyValidator } from "./policy-validator";

const analysis = {
    maintenance: {
        urgency: "URGENT",
        operationalRecommendation: "IMMEDIATE_INSPECTION_RECOMMENDED",
    },
    quality: {
        dispositionRecommendation: "QUARANTINE_RECOMMENDED",
    },
} as CrossFunctionalAnalysis;

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

describe("RecoveryPolicyValidator", () => {
    const validator = new RecoveryPolicyValidator();

    it("accepts pause, inspect, hold, and reroute strategy", () => {
        const result = validator.validate(
            plan("PLAN-A", [
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "Pause",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId: "M-02",
                    reasoning: "Inspect",
                },
                {
                    type: "HOLD_OUTPUT",
                    orderId: "ORD-428",
                    reasoning: "Hold",
                },
                {
                    type: "REROUTE_ORDER",
                    machineId: "M-02",
                    orderId: "ORD-428",
                    targetMachineId: "M-03",
                    reasoning: "Reroute",
                },
            ]),
            analysis,
        );

        expect(result.compliant).toBe(true);
        expect(result.violations).toEqual([]);
    });

    it("rejects continued production against immediate inspection policy", () => {
        const result = validator.validate(
            plan("PLAN-B", [
                {
                    type: "CONTINUE_PRODUCTION",
                    machineId: "M-02",
                    reasoning: "Continue",
                },
                {
                    type: "HOLD_OUTPUT",
                    orderId: "ORD-428",
                    reasoning: "Hold",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId: "M-02",
                    reasoning: "Inspect later",
                },
            ]),
            analysis,
        );

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain("CONTINUE_PRODUCTION conflicts with IMMEDIATE_INSPECTION_RECOMMENDED");
    });

    it("requires output hold when quarantine is recommended", () => {
        const result = validator.validate(
            plan("PLAN-C", [
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "Pause",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId: "M-02",
                    reasoning: "Inspect",
                },
            ]),
            analysis,
        );

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain("HOLD_OUTPUT is required by QUARANTINE_RECOMMENDED");
    });

    it("requires inspection for urgent immediate-inspection policy", () => {
        const result = validator.validate(
            plan("PLAN-D", [
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning: "Pause",
                },
                {
                    type: "HOLD_OUTPUT",
                    orderId: "ORD-428",
                    reasoning: "Hold",
                },
            ]),
            analysis,
        );

        expect(result.compliant).toBe(false);
        expect(result.violations).toContain("INSPECT_MACHINE is required by IMMEDIATE_INSPECTION_RECOMMENDED");
    });
});