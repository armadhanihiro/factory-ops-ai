import type { QualityAssessment } from "@/types/quality";

import type {
  QualityContext,
  QualityProvider,
} from "./types";

export class MockQualityProvider implements QualityProvider {
    async assess(context: QualityContext): Promise<QualityAssessment> {
        const { incident, machine, order } = context;
        const defectSignal = incident.trigger.signals.find((signal) => signal.metric === "defectRate");
        const hasElevatedDefects = defectSignal !== undefined && defectSignal.value > defectSignal.baseline;

        return {
            incidentId: incident.id,
            machineId: machine.id,
            orderId: order?.id ?? null,
            incidentSeverity: incident.severity,
            overallQualityRisk: hasElevatedDefects ? "HIGH" : "MEDIUM",

            risks: [
                {
                    category: "PRODUCT_CONFORMANCE",
                    severity: hasElevatedDefects ? "HIGH" : "MEDIUM",
                    reasoning: hasElevatedDefects 
                        ? "The observed defect rate is above its baseline during the machine incident." 
                        : "The machine incident may affect product conformance even though no elevated defect signal was captured.",
                },
            ],

            evidence: defectSignal ? [
                    {
                        metric: defectSignal.metric,
                        observation: `${defectSignal.value} compared with baseline ${defectSignal.baseline}`,
                        significance: "An elevated defect rate indicates increased product quality risk during the incident.",
                    },
            ] : [],

            recommendedInspections: [
                "Inspect units produced during the incident window.",
                "Verify critical product dimensions and visual quality.",
                "Compare sampled units against the approved product specification.",
            ],

            dispositionRecommendation: hasElevatedDefects ? "HOLD_FOR_INSPECTION" : "CONTINUE_MONITORING",
            reasoning: hasElevatedDefects
                ? "Product quality risk is elevated because the active production order was exposed to an increased defect rate during the incident."
                : "No direct elevated defect signal was captured, but the affected order should continue to be monitored while the machine incident remains active.",
            generatedAt: new Date().toISOString(),
            provider: "mock",
        };
    }
}