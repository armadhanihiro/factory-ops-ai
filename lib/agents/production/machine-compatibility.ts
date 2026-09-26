import type { Machine } from "@/types/factory";

const compatibleMachineIds: Record<string, string[]> = {
    "M-01": [],
    "M-02": ["M-03"],
    "M-03": ["M-02"],
    "M-04": [],
};

export function findCompatibleMachines(machineId: string, machines: Machine[]): Machine[] {
    const compatibleIds = compatibleMachineIds[machineId] ?? [];

    return machines.filter((machine) => compatibleIds.includes(machine.id));
}