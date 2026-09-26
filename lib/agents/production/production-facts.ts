import type { MachineStatus } from "@/types/factory";

import type { ProductionContext } from "./types";

export interface ProductionAlternativeFact {
    machineId: string;
    status: MachineStatus;
    capacity: number;
    available: boolean;
}

export interface ProductionFacts {
    affectedOrderId: string | null;
    targetUnits: number | null;
    completedUnits: number | null;
    remainingUnits: number | null;
    currentMachineCapacity: number;
    productionAtRisk: boolean;
    alternatives: ProductionAlternativeFact[];
}

function isMachineAvailable(status: MachineStatus): boolean {
    return status === "IDLE";
}

export function buildProductionFacts(context: ProductionContext): ProductionFacts {
    const { affectedOrder } = context;

    return {
        affectedOrderId: affectedOrder?.id ?? null,
        targetUnits: affectedOrder?.targetUnits ?? null,
        completedUnits: affectedOrder?.completedUnits ?? null,
        remainingUnits: context.remainingUnits,
        currentMachineCapacity: context.affectedMachine.capacity,
        productionAtRisk: affectedOrder !== null &&
        (
            affectedOrder.status === "AT_RISK" ||
            context.incident.severity === "HIGH" ||
            context.incident.severity === "CRITICAL"
        ),

        alternatives: context.compatibleMachines.map((machine) => ({
            machineId: machine.id,
            status: machine.status,
            capacity: machine.capacity,
            available: isMachineAvailable(machine.status),
        })),
    };
}