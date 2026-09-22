import type {
    Incident,
    Machine,
} from "@/types/factory";

import type { DiagnosticResult } from "@/types/diagnostic";
import type { MaintenanceAssessment } from "@/types/maintenance";

export interface MaintenanceContext {
    incident: Incident;
    machine: Machine;
    diagnosis: DiagnosticResult;
}

export interface MaintenanceProvider {
    assess(context: MaintenanceContext): Promise<MaintenanceAssessment>;
}