import type { ProductionAssessment } from "@/types/production";

import { buildProductionFacts } from "./production-facts";
import type {
    ProductionContext,
    ProductionProvider,
} from "./types";

export class MockProductionProvider implements ProductionProvider{
    async assess(context: ProductionContext): Promise<ProductionAssessment> {
        const facts = buildProductionFacts(context);

        const availableAlternative = facts.alternatives.some((alternative) => alternative.available);

        return {
            incidentId: context.incident.id,
            machineId: context.affectedMachine.id,
            incidentSeverity: context.incident.severity,
            affectedOrderId: facts.affectedOrderId,
            impactLevel: facts.productionAtRisk ? "HIGH" : "LOW",
            remainingUnits: facts.remainingUnits,
            currentMachineCapacity: facts.currentMachineCapacity,
            productionAtRisk: facts.productionAtRisk,
            alternatives: facts.alternatives.map((alternative) => ({
                machineId: alternative.machineId,
                available: alternative.available,
                capacity: alternative.capacity,
                reasoning: alternative.available ? "Compatible machine is currently idle and available." : "Compatible machine is not currently available.",
            })),
            evidence: [
                {
                    metric: "remainingUnits",
                    value: facts.remainingUnits?.toString() ?? "unknown",
                    significance: "Remaining production quantity for the affected order.",
                },
            ],
            recommendedStrategy: availableAlternative ? "PREPARE_BACKUP_CAPACITY" : "PAUSE_AND_REPLAN",
            reasoning: availableAlternative
                ? "Production is at risk and compatible backup capacity is available."
                : "Production is at risk and no compatible machine is currently available.",
            generatedAt: new Date().toISOString(),
            provider: "mock",
        };
    }
}