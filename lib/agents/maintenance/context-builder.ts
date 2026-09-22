import type {
  FactoryState,
  Incident,
} from "@/types/factory";

import type { DiagnosticResult } from "@/types/diagnostic";

import type { MaintenanceContext } from "./types";

export function buildMaintenanceContext(incident: Incident, factoryState: FactoryState, diagnosis: DiagnosticResult): MaintenanceContext {
    const machine = factoryState.machines.find((item) => item.id === incident.machineId);

    if (!machine) {
        throw new Error(`Machine ${incident.machineId} not found`);
    }

    if (diagnosis.incidentId !== incident.id) {
        throw new Error(`Diagnosis does not belong to incident ${incident.id}`);
    }

    if (diagnosis.machineId !== machine.id) {
        throw new Error(`Diagnosis does not belong to machine ${machine.id}`);
    }

    return {
        incident,
        machine,
        diagnosis,
    };
}