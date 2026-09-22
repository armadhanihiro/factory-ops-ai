import type { QualityContext } from "./types";

export interface QualityAIContext {
    incident: {
        id: string;
        machineId: string;
        severity: string;
        detectedAt: string;
        signals: Array<{
            metric: string;
            value: number;
            baseline: number;
            deviationPercent: number;
            score: number;
        }>;
    };

    machine: {
        id: string;
        type: string;
        status: string;
    };

    order: {
        id: string;
        product: string;
        targetUnits: number;
        completedUnits: number;
        deadline: string;
        status: string;
    } | null;
}

export function buildQualityAIContext(context: QualityContext): QualityAIContext {
    const { incident, machine, order } = context;

    return {
        incident: {
            id: incident.id,
            machineId: incident.machineId,
            severity: incident.severity,
            detectedAt: incident.detectedAt,
            signals: incident.trigger.signals.map((signal) => ({
                metric: signal.metric,
                value: signal.value,
                baseline: signal.baseline,
                deviationPercent: signal.deviationPercent,
                score: signal.score,
            })),
        },

        machine: {
            id: machine.id,
            type: machine.type,
            status: machine.status,
        },

        order: order ? {
            id: order.id,
            product: order.product,
            targetUnits: order.targetUnits,
            completedUnits: order.completedUnits,
            deadline: order.deadline,
            status: order.status,
        } : null,
    };
}