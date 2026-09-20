import {
    FactoryState,
    Machine,
    MachineTelemetry,
} from "@/types/factory";

import {
    calculateAverageUtilization,
    calculateTotalOutput,
} from "./factory";

import { detectFactoryAnomalies } from "@/lib/anomaly/detector";

import { applyScenario } from "./scenarios";

function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function fluctuate(value: number, amount: number): number {
    return value + randomBetween(-amount, amount);
}

function simulateTelemetry(machine: Machine): MachineTelemetry {
    const current = machine.telemetry;

    if (machine.status === "IDLE" || machine.status === "MAINTENANCE") {
        return {
            ...current,
            timestamp: new Date().toISOString(),
            outputRate: 0,
        };
    }

    return {
        ...current,
        timestamp: new Date().toISOString(),
        temperature: Number(clamp(fluctuate(current.temperature, 0.8), 20, 120).toFixed(1)),
        vibration: current.vibration !== undefined ? Number(clamp(fluctuate(current.vibration, 0.15), 0, 20).toFixed(2)) : undefined,
        motorCurrent: Number(clamp( fluctuate(current.motorCurrent, 1), 0, 100).toFixed(1)),
        pressure: current.pressure !== undefined ? Number(clamp(fluctuate(current.pressure, 2), 0, 250).toFixed(1)) : undefined,
        outputRate: Math.round(clamp(fluctuate(current.outputRate, 3), 0, machine.capacity)),
        defectRate: current.defectRate !== undefined ? Number(clamp(fluctuate(current.defectRate, 0.1), 0, 100).toFixed(2)) : undefined,
    };
}

export function tickFactory(state: FactoryState): FactoryState {
    const machines = state.machines.map((machine) => ({
        ...machine,
        telemetry: simulateTelemetry(machine),
    }));

    let nextState: FactoryState = {
        ...state,
        timestamp: new Date().toISOString(),
        machines,
    };

    // Apply active simulated failure after normal
    // telemetry fluctuation.
    nextState = applyScenario(nextState);

    const anomalies = detectFactoryAnomalies(nextState.machines);

    return {
        ...nextState,
        totalOutput: calculateTotalOutput(nextState.machines),
        averageUtilization: calculateAverageUtilization(nextState.machines),
        anomalies,
    };
}