import {
    FactoryState,
    Machine,
    ProductionOrder,
} from "@/types/factory";

function now(): string {
    return new Date().toISOString();
}

const machines: Machine[] = [
    {
        id: "M-01",
        name: "Mixer",
        type: "MIXER",
        status: "RUNNING",
        capacity: 140,
        telemetry: {
            machineId: "M-01",
            timestamp: now(),
            temperature: 64,
            motorCurrent: 31,
            outputRate: 125,
        },
    },

    {
        id: "M-02",
        name: "Extruder A",
        type: "EXTRUDER",
        status: "RUNNING",
        capacity: 120,
        currentOrderId: "ORD-428",
        telemetry: {
            machineId: "M-02",
            timestamp: now(),
            temperature: 71,
            vibration: 3.1,
            motorCurrent: 42,
            pressure: 118,
            outputRate: 116,
            defectRate: 1.1,
        },
    },

    {
        id: "M-03",
        name: "Extruder B",
        type: "EXTRUDER",
        status: "IDLE",
        capacity: 100,
        telemetry: {
            machineId: "M-03",
            timestamp: now(),
            temperature: 42,
            vibration: 1.2,
            motorCurrent: 8,
            pressure: 25,
            outputRate: 0,
            defectRate: 0,
        },
    },

    {
        id: "M-04",
        name: "Packaging",
        type: "PACKAGING",
        status: "RUNNING",
        capacity: 150,
        telemetry: {
            machineId: "M-04",
            timestamp: now(),
            temperature: 55,
            motorCurrent: 28,
            outputRate: 112,
        },
    },
];

const orders: ProductionOrder[] = [
    {
        id: "ORD-428",
        product: "Product Alpha",
        targetUnits: 5000,
        completedUnits: 2920,
        assignedMachineId: "M-02",
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000,).toISOString(),
        status: "IN_PROGRESS",
    },
];

export function createInitialFactoryState(): FactoryState {
    return {
        timestamp: now(),
        machines: structuredClone(machines),
        orders: structuredClone(orders),
        totalOutput: calculateTotalOutput(machines),
        averageUtilization: calculateAverageUtilization(machines),
        anomalies: [],
    };
}

export function calculateTotalOutput(machines: Machine[]): number {
    return machines.reduce((total, machine) => total + machine.telemetry.outputRate, 0);
}

export function calculateAverageUtilization(machines: Machine[]): number {
    const activeProductionMachines = machines.filter((machine) => machine.status !== "IDLE",);

    if (activeProductionMachines.length === 0) {
        return 0;
    }

    const utilization = activeProductionMachines.reduce((total, machine) => {
        return (total + machine.telemetry.outputRate / machine.capacity);
    }, 0) / activeProductionMachines.length;

    return Math.round(utilization * 100);
}