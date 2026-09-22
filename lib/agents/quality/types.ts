import type {
    Incident,
    Machine,
    ProductionOrder,
} from "@/types/factory";

import type { QualityAssessment } from "@/types/quality";

export interface QualityContext {
    incident: Incident;
    machine: Machine;
    order: ProductionOrder | null;
}

export interface QualityProvider {
    assess(context: QualityContext): Promise<QualityAssessment>;
}