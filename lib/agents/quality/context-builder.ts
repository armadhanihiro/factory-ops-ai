import type {
    FactoryState,
    Incident,
} from "@/types/factory";

import type { QualityContext } from "./types";

export function buildQualityContext(incident: Incident, factoryState: FactoryState): QualityContext {
    const machine = factoryState.machines.find((item) => item.id === incident.machineId);

    if (!machine) {
        throw new Error(`Machine ${incident.machineId} not found`);
    }

    const order = machine.currentOrderId ? factoryState.orders.find((item) => item.id === machine.currentOrderId) ?? null : null;

    return {
        incident,
        machine,
        order,
    };
}