import type { ProductionAssessment } from "@/types/production";

const globalForProduction = globalThis as typeof globalThis & {
    productionResults?: Map<string, ProductionAssessment>;
};

const productionResults = globalForProduction.productionResults ?? new Map<string, ProductionAssessment>();

if (process.env.NODE_ENV !== "production") {
    globalForProduction.productionResults = productionResults;
}

export function getProductionResult(incidentId: string): ProductionAssessment | undefined {
    return productionResults.get(incidentId);
}

export function saveProductionResult(result: ProductionAssessment): void {
    productionResults.set(result.incidentId, result);
}

export function clearProductionResults(): void {
    productionResults.clear();
}