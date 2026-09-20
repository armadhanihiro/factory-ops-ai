import type { FactoryState, Incident } from "@/types/factory";

export interface DiagnosticSignalContext {
    metric: string;
    value: number;
    baseline: number;
    deviationPercent: number;
    score: number;
}

export interface DiagnosticMachineContext {
    id: string;
    type: string;
    status: string;
    currentOrderId?: string;
}

export interface GeminiDiagnosticContext {
    incident: {
        id: string;
        machineId: string;
        severity: string;
        anomalyScore: number;
        detectedAt: string;
    };
    machine: DiagnosticMachineContext;
    signals: DiagnosticSignalContext[];
}

export function buildDiagnosticContext(incident: Incident, factoryState: FactoryState): GeminiDiagnosticContext {
    const machine = factoryState.machines.find(
        (item) => item.id === incident.machineId
    );

    if (!machine) {
        throw new Error(`Machine ${incident.machineId} not found for incident ${incident.id}`);
    }

    return {
        incident: {
            id: incident.id,
            machineId: incident.machineId,
            severity: incident.severity,
            anomalyScore: incident.trigger.anomalyScore,
            detectedAt: incident.detectedAt,
        },
        machine: {
            id: machine.id,
            type: machine.type,
            status: machine.status,
            currentOrderId: machine.currentOrderId,
        },
        signals: incident.trigger.signals.map((signal) => ({
            metric: signal.metric,
            value: signal.value,
            baseline: signal.baseline,
            deviationPercent: signal.deviationPercent,
            score: signal.score,
        })),
    };
}