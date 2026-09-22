import type {
    FactoryState,
    Incident,
} from "@/types/factory";

import type { DiagnosticResult } from "@/types/diagnostic";
import type { MaintenanceAssessment } from "@/types/maintenance";

import { buildMaintenanceContext } from "./context-builder";
import { MockMaintenanceProvider } from "./mock-provider";
import type { MaintenanceProvider } from "./types";

export class MaintenanceAgent {
    constructor(private readonly provider: MaintenanceProvider = new MockMaintenanceProvider()) {}

    async assessMaintenanceNeeds(incident: Incident, factoryState: FactoryState, diagnosis: DiagnosticResult): Promise<MaintenanceAssessment> {
        const context = buildMaintenanceContext(incident, factoryState, diagnosis);

        return this.provider.assess(context);
    }
}