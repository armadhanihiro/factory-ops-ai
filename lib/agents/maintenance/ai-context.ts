import type { MaintenanceContext } from "./types";

export interface MaintenanceAIContext {
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
        }>;
    };

    machine: {
        id: string;
        name: string;
        type: string;
        status: string;
    };

    diagnosis: {
        failureMode: string;
        confidence: number;
        reasoning: string;
        evidence: Array<{
            metric: string;
            observation: string;
            significance: string;
        }>;
        recommendedChecks: string[];
    };
}

export function buildMaintenanceAIContext(context: MaintenanceContext): MaintenanceAIContext {
    return {
        incident: {
            id: context.incident.id,
            machineId: context.incident.machineId,
            severity: context.incident.severity,
            detectedAt: context.incident.detectedAt,
            signals: context.incident.trigger.signals.map((signal) => ({
                metric: signal.metric,
                value: signal.value,
                baseline: signal.baseline,
                deviationPercent: signal.deviationPercent,
            })),
        },

        machine: {
            id: context.machine.id,
            name: context.machine.name,
            type: context.machine.type,
            status: context.machine.status,
        },

        diagnosis: {
            failureMode: context.diagnosis.primaryDiagnosis.failureMode,
            confidence: context.diagnosis.primaryDiagnosis.confidence,
            reasoning: context.diagnosis.primaryDiagnosis.reasoning,
            evidence: context.diagnosis.evidence,
            recommendedChecks: context.diagnosis.recommendedChecks,
        },
    };
}