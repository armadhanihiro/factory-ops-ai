import { GoogleGenAI } from "@google/genai";

import type { MaintenanceAssessment } from "@/types/maintenance";

import { buildMaintenanceAIContext } from "./ai-context";
import { buildMaintenancePrompt } from "./prompt";
import { maintenanceResponseSchema } from "./schema";
import type { MaintenanceContext, MaintenanceProvider } from "./types";

type GeminiMaintenanceResponse = Omit<
    MaintenanceAssessment,
    | "incidentId"
    | "machineId"
    | "incidentSeverity"
    | "generatedAt"
    | "provider"
>;

export class GeminiMaintenanceProvider implements MaintenanceProvider {
    async assess(context: MaintenanceContext): Promise<MaintenanceAssessment> {
        const project = process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
        const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

        if (!project) {
            throw new Error("GOOGLE_CLOUD_PROJECT is required for Gemini maintenance provider",);
        }

        const ai = new GoogleGenAI({
            vertexai: true,
            project,
            location,
        });

        const aiContext = buildMaintenanceAIContext(context);
        const prompt = buildMaintenancePrompt(aiContext);

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: maintenanceResponseSchema,
                temperature: 0.2,
            },
        });

        if (!response.text) {
            throw new Error("Gemini returned an empty maintenance assessment");
        }

        const parsed = JSON.parse(response.text) as GeminiMaintenanceResponse;

        return {
            incidentId: context.incident.id,
            machineId: context.machine.id,
            incidentSeverity: context.incident.severity,
            urgency: parsed.urgency,

            // Preserve the upstream diagnosis exactly.
            // Maintenance should not silently replace it.
            suspectedFailureMode: context.diagnosis.primaryDiagnosis.failureMode,

            evidence: parsed.evidence,
            recommendedTasks: parsed.recommendedTasks,
            estimatedInterventionMinutes: parsed.estimatedInterventionMinutes,
            requiredSkills: parsed.requiredSkills,
            partsToInspect: parsed.partsToInspect,
            operationalRecommendation: parsed.operationalRecommendation,
            reasoning: parsed.reasoning,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}