import type { FactoryState } from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";
import type { ProductionAssessment } from "@/types/production";
import type { QualityAssessment } from "@/types/quality";

import { buildProductionContext } from "./context";
import { createProductionProvider } from "./provider";
import type { ProductionProvider } from "./types";

export class ProductionAgent {
    constructor(private readonly provider: ProductionProvider = createProductionProvider()) {}

    async assessProductionImpact(incidentId: string, factoryState: FactoryState, qualityAssessment: QualityAssessment, maintenanceAssessment: MaintenanceAssessment): Promise<ProductionAssessment> {
        const context = buildProductionContext(incidentId, factoryState, qualityAssessment, maintenanceAssessment);

        return this.provider.assess(context);
    }
}