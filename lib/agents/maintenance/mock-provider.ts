import type { MaintenanceAssessment } from "@/types/maintenance";

import type {
    MaintenanceContext,
    MaintenanceProvider,
} from "./types";

export class MockMaintenanceProvider implements MaintenanceProvider{
    async assess(context: MaintenanceContext): Promise<MaintenanceAssessment> {
        const { incident, machine, diagnosis } = context;
        const vibrationSignal = incident.trigger.signals.find((signal) => signal.metric === "vibration");
        const highVibration = vibrationSignal !== undefined && vibrationSignal.value > vibrationSignal.baseline;

        return {
            incidentId: incident.id,
            machineId: machine.id,
            incidentSeverity: incident.severity,
            urgency: highVibration ? "URGENT" : "SCHEDULE_SOON",
            suspectedFailureMode: diagnosis.primaryDiagnosis.failureMode,
            evidence: [
                {
                    source: "DIAGNOSIS",
                    observation: diagnosis.primaryDiagnosis.failureMode,
                    significance: "The diagnostic agent identified this as the primary suspected failure mode.",
                },
                ...(vibrationSignal ? [
                    {
                        source: "INCIDENT" as const,
                        observation: `Vibration ${vibrationSignal.value} compared with baseline ${vibrationSignal.baseline}`,
                        significance: "Elevated vibration indicates that mechanical inspection should be prioritized.",
                    },
                ] : []),
            ],
            recommendedTasks: [
                {
                    task: "Inspect bearing and rotating assembly",
                    purpose: "Check for wear, looseness, misalignment, or lubrication issues.",
                    priority: "HIGH",
                },
                {
                    task: "Perform targeted vibration inspection",
                    purpose: "Confirm the location and severity of the mechanical vibration source.",
                    priority: "HIGH",
                },
            ],
            estimatedInterventionMinutes: 45,
            requiredSkills: [
                "Mechanical maintenance technician",
            ],
            partsToInspect: [
                "Bearings",
                "Drive assembly",
                "Couplings",
            ],
            operationalRecommendation: highVibration ? "IMMEDIATE_INSPECTION_RECOMMENDED" : "PLAN_MAINTENANCE",
            reasoning: highVibration
                ? "The diagnostic hypothesis combined with elevated vibration supports urgent mechanical inspection before determining the required intervention."
                : "The diagnosis indicates a maintenance concern that should be scheduled for inspection.",

            generatedAt: new Date().toISOString(),
            provider: "mock",
        };
    }
}