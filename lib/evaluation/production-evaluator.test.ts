import { describe, expect, it } from "vitest";

import { evaluateProductionAssessment } from "./production-evaluator";

import type { ProductionFacts } from "@/lib/agents/production/production-facts";
import type { ProductionAssessment } from "@/types/production";

const facts: ProductionFacts = {
    affectedOrderId: "ORD-428",
    targetUnits: 5000,
    completedUnits: 2920,
    remainingUnits: 2080,
    currentMachineCapacity: 120,
    productionAtRisk: true,
    alternatives: [
        {
            machineId: "M-03",
            status: "IDLE",
            capacity: 100,
            available: true,
        },
    ],
};

function createAssessment(): ProductionAssessment {
    return {
        incidentId: "INC-001",
        machineId: "M-02",
        incidentSeverity: "HIGH",
        affectedOrderId: "ORD-428",
        impactLevel: "HIGH",
        remainingUnits: 2080,
        currentMachineCapacity: 120,
        productionAtRisk: true,
        alternatives: [
            {
                machineId: "M-03",
                available: true,
                capacity: 100,
                reasoning:
                "M-03 is an available compatible alternative.",
            },
        ],
        evidence: [
            {
                metric: "Remaining Units",
                value: "2080",
                significance:
                "ORD-428 still has production remaining.",
            },
            {
                metric: "Alternative Machine",
                value: "M-03",
                significance:
                "M-03 is available as an alternative.",
            },
        ],
        recommendedStrategy: "REROUTE_RECOMMENDED",
        reasoning: "M-03 is an available alternative. Rerouting is recommended for supervisor consideration.",
        generatedAt: "2026-09-27T00:00:00.000Z",
        provider: "gemini",
    };
}

describe("evaluateProductionAssessment", () => {
    it("scores correct deterministic facts as fully consistent", () => {
        const result = evaluateProductionAssessment(createAssessment(), facts);

        expect(result.deterministicFactsScore).toBe(1);
    });

    it("detects an incorrect remaining unit count", () => {
        const assessment = createAssessment();
        assessment.remainingUnits = 1900;
        const result = evaluateProductionAssessment(assessment, facts);

        expect(result.deterministicFactsScore).toBeLessThan(1);
    });

    it("detects an incorrect alternative capacity", () => {
        const assessment = createAssessment();
        assessment.alternatives[0].capacity = 150;
        const result = evaluateProductionAssessment(assessment, facts);

        expect(result.alternativeConsistencyScore).toBe(0);
    });

    it("detects an operational authority boundary violation", () => {
        const assessment = createAssessment();
        assessment.reasoning = "M-02 is unavailable and production should be rerouted to M-03.";
        const result = evaluateProductionAssessment(assessment, facts);

        expect(result.authorityBoundaryScore).toBe(0);
    });

    it("allows advisory recommendations without treating them as executed actions", () => {
        const assessment = createAssessment();
        assessment.reasoning = "M-03 is available and rerouting is recommended for supervisor consideration.";
        const result = evaluateProductionAssessment(assessment, facts);

        expect(result.authorityBoundaryScore).toBe(1);
    });

    it("accepts a structurally valid production assessment", () => {
        const result = evaluateProductionAssessment(createAssessment(), facts);

        expect(result.outputValidityScore).toBe(1);
    });
});