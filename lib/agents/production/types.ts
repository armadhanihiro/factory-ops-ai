import type {
    Incident,
    Machine,
    ProductionOrder,
} from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";
import type { ProductionAssessment } from "@/types/production";
import type { QualityAssessment } from "@/types/quality";

export interface ProductionContext {
    incident: Incident;
    affectedMachine: Machine;
    affectedOrder: ProductionOrder | null;
    remainingUnits: number | null;
    compatibleMachines: Machine[];
    qualityAssessment: QualityAssessment;
    maintenanceAssessment: MaintenanceAssessment;
}

export interface ProductionProvider {
    assess(context: ProductionContext): Promise<ProductionAssessment>;
}