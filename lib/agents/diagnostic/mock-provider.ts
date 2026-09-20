import type {
    DiagnosticContext,
    DiagnosticProvider,
} from "./types";

import type { DiagnosticResult } from "@/types/diagnostic";

export class MockDiagnosticProvider implements DiagnosticProvider {
    async diagnose(context: DiagnosticContext): Promise<DiagnosticResult> {
        const { incident } = context;
        const vibrationSignal = incident.trigger.signals.find((signal) => signal.metric === "vibration");
        const temperatureSignal = incident.trigger.signals.find((signal) => signal.metric === "temperature");
        const evidence = [];

        if (vibrationSignal) {
            evidence.push({
                metric: "vibration",
                observation: `Vibration increased to ${vibrationSignal.value}`,
                significance: "Elevated vibration can indicate degradation in rotating mechanical components.",
            });
        }

        if (temperatureSignal) {
            evidence.push({
                metric: "temperature",
                observation: `Temperature increased to ${temperatureSignal.value}`,
                significance: "Increasing temperature can indicate additional friction or mechanical load.",
            });
        }

        return {
            incidentId: incident.id,
            machineId: incident.machineId,
            severity: incident.severity,
            primaryDiagnosis: {
                failureMode: "bearing_degradation",
                confidence: 0.86,
                reasoning: "The combination of increasing vibration and temperature is consistent with progressive bearing degradation.",
            },
            alternativeHypotheses: [
                {
                    failureMode: "shaft_misalignment",
                    confidence: 0.38,
                    reasoning: "Misalignment can produce elevated vibration, although the available evidence is less consistent with this failure mode.",
                },
                {
                    failureMode: "lubrication_issue",
                    confidence: 0.31,
                    reasoning: "Insufficient lubrication could explain additional friction and rising temperature.",
                },
            ],
            evidence,
            recommendedChecks: [
                "Inspect the main drive bearing for abnormal wear.",
                "Check bearing lubrication condition.",
                "Inspect shaft alignment.",
                "Compare current vibration spectrum with the machine baseline.",
            ],
            generatedAt: new Date().toISOString(),
            provider: "mock",
        };
    }
}