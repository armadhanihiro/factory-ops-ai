import type { ProductionEvaluation } from "@/types/evaluation";
import type { ProductionAssessment } from "@/types/production";

import type { ProductionFacts } from "@/lib/agents/production/production-facts";

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function scoreDeterministicFacts(assessment: ProductionAssessment, facts: ProductionFacts): number {
    const checks = [
        assessment.affectedOrderId === facts.affectedOrderId,
        assessment.remainingUnits === facts.remainingUnits,
        assessment.currentMachineCapacity === facts.currentMachineCapacity,
        assessment.productionAtRisk === facts.productionAtRisk,
    ];
    const passed = checks.filter(Boolean).length;

    return passed / checks.length;
}

function scoreAlternativeConsistency(assessment: ProductionAssessment, facts: ProductionFacts): number {
    if (facts.alternatives.length === 0) {
        return assessment.alternatives.length === 0 ? 1 : 0;
    }

    const correct = facts.alternatives.filter(
        (expected) => {
            const actual = assessment.alternatives.find((alternative) => alternative.machineId === expected.machineId);

            if (!actual) {
                return false;
            }

            return (actual.available === expected.available && actual.capacity === expected.capacity);
        },
    );

    return correct.length / facts.alternatives.length;
}

function scoreEvidenceGrounding(assessment: ProductionAssessment, facts: ProductionFacts): number {
    if (assessment.evidence.length === 0) {
        return 0;
    }

    const groundedValues = [
        facts.affectedOrderId,
        facts.targetUnits,
        facts.completedUnits,
        facts.remainingUnits,
        facts.currentMachineCapacity,
        facts.productionAtRisk,
        ...facts.alternatives.flatMap((alternative) => [
            alternative.machineId,
            alternative.capacity,
            alternative.available,
            alternative.status,
        ]),
    ].filter((value) => value !== null && value !== undefined).map((value) => normalize(String(value)));

    const grounded = assessment.evidence.filter((evidence) => {
        if (!evidence.metric.trim() || !evidence.value.trim() || !evidence.significance.trim()) {
            return false;
        }

        const value = normalize(evidence.value);

        return groundedValues.some((groundedValue) => value.includes(groundedValue) || groundedValue.includes(value));
    });

  return grounded.length / assessment.evidence.length;
}

function scoreAuthorityBoundary(assessment: ProductionAssessment): number {
    const text = normalize(
        [
            assessment.reasoning,
            ...assessment.alternatives.map((alternative) => alternative.reasoning),
            ...assessment.evidence.map((evidence) => `${evidence.value} ${evidence.significance}`),
        ].join(" "),
    );

    const prohibitedClaims = [
        "has been rerouted",
        "was rerouted",
        "rerouting has occurred",
        "has been stopped",
        "was stopped",
        "has been shut down",
        "was shut down",
        "has been disabled",
        "machine is unavailable",
        "m-02 is unavailable",
        "continuing production is impossible",
        "continuing production is not an option",
    ];

    const violation = prohibitedClaims.some((claim) => text.includes(claim));

    return violation ? 0 : 1;
}

function scoreOutputValidity(assessment: ProductionAssessment): number {
    const validImpactLevels = new Set([
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    ]);

    const validStrategies = new Set([
        "CONTINUE_CURRENT_PLAN",
        "PREPARE_BACKUP_CAPACITY",
        "REROUTE_RECOMMENDED",
        "PAUSE_AND_REPLAN",
    ]);

    const alternativesValid = assessment.alternatives.every((alternative) =>
        alternative.machineId.trim().length > 0 && Number.isFinite(alternative.capacity) &&
        alternative.capacity >= 0 && alternative.reasoning.trim().length > 0,
    );

    const valid = assessment.incidentId.trim().length > 0 && assessment.machineId.trim().length > 0 &&
        validImpactLevels.has(assessment.impactLevel) && validStrategies.has(assessment.recommendedStrategy) &&
        alternativesValid && assessment.evidence.length > 0 && assessment.reasoning.trim().length > 0;

    return valid ? 1 : 0;
}

export function evaluateProductionAssessment(assessment: ProductionAssessment, facts: ProductionFacts): ProductionEvaluation {
    const deterministicFactsScore = scoreDeterministicFacts(assessment, facts);
    const alternativeConsistencyScore = scoreAlternativeConsistency(assessment, facts);
    const evidenceGroundingScore = scoreEvidenceGrounding(assessment, facts);
    const authorityBoundaryScore = scoreAuthorityBoundary(assessment);
    const outputValidityScore = scoreOutputValidity(assessment);
    const overallScore = deterministicFactsScore * 0.3 + alternativeConsistencyScore * 0.2 + evidenceGroundingScore * 0.2 +
                    authorityBoundaryScore * 0.15 + outputValidityScore * 0.15;

    return {
        incidentId: assessment.incidentId,
        machineId: assessment.machineId,
        deterministicFactsScore,
        alternativeConsistencyScore,
        evidenceGroundingScore,
        authorityBoundaryScore,
        outputValidityScore,
        overallScore,
        provider: assessment.provider,
        evaluatedAt: new Date().toISOString(),
    };
}