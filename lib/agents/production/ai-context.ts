import type { ProductionContext } from "./types";
import {
    buildProductionFacts,
    type ProductionFacts,
} from "./production-facts";

export interface ProductionAIContext {
    incident: {
        id: string;
        machineId: string;
        severity: string;
    };
    production: ProductionFacts;
    quality: {
        overallQualityRisk: string;
        dispositionRecommendation: string;
        reasoning: string;
    };
    maintenance: {
        urgency: string;
        suspectedFailureMode: string;
        operationalRecommendation: string;
        reasoning: string;
    };
}

export function buildProductionAIContext(context: ProductionContext): ProductionAIContext {
    return {
        incident: {
            id: context.incident.id,
            machineId: context.incident.machineId,
            severity: context.incident.severity,
        },
        production: buildProductionFacts(context),
        quality: {
            overallQualityRisk: context.qualityAssessment.overallQualityRisk,
            dispositionRecommendation: context.qualityAssessment.dispositionRecommendation,
            reasoning: context.qualityAssessment.reasoning,
        },

        maintenance: {
            urgency: context.maintenanceAssessment.urgency,
            suspectedFailureMode: context.maintenanceAssessment.suspectedFailureMode,
            operationalRecommendation: context.maintenanceAssessment.operationalRecommendation,
            reasoning: context.maintenanceAssessment.reasoning,
        },
    };
}