import type { FactoryState } from "@/types/factory";
import type { MaintenanceAssessment } from "@/types/maintenance";
import type { QualityAssessment } from "@/types/quality";

import { findCompatibleMachines } from "./machine-compatibility";
import type { ProductionContext } from "./types";

export function buildProductionContext(incidentId: string, factoryState: FactoryState, qualityAssessment: QualityAssessment, maintenanceAssessment: MaintenanceAssessment): ProductionContext {
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
    }

    const affectedMachine = factoryState.machines.find((machine) => machine.id === incident.machineId);

    if (!affectedMachine) {
        throw new Error(`Affected machine not found: ${incident.machineId}`);
    }

    if (qualityAssessment.incidentId !== incident.id || qualityAssessment.machineId !== affectedMachine.id) {
        throw new Error("Quality assessment does not match production incident");
    }

    if (maintenanceAssessment.incidentId !== incident.id || maintenanceAssessment.machineId !== affectedMachine.id) {
        throw new Error("Maintenance assessment does not match production incident");
    }

    const affectedOrder = affectedMachine.currentOrderId ? factoryState.orders.find((order) => order.id === affectedMachine.currentOrderId) ?? null : null;
    const remainingUnits = affectedOrder ? Math.max(affectedOrder.targetUnits - affectedOrder.completedUnits, 0) : null;
    const compatibleMachines = findCompatibleMachines(affectedMachine.id, factoryState.machines);

    return {
        incident,
        affectedMachine,
        affectedOrder,
        remainingUnits,
        compatibleMachines,
        qualityAssessment,
        maintenanceAssessment,
    };
}