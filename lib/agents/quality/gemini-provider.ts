import { GoogleGenAI } from "@google/genai";

import type { QualityAssessment } from "@/types/quality";

import { buildQualityAIContext } from "./ai-context";
import { buildQualityPrompt } from "./prompt";
import { qualityResponseSchema } from "./schema";

import type {
    QualityContext,
    QualityProvider,
} from "./types";

interface GeminiQualityResponse {
    overallQualityRisk: QualityAssessment["overallQualityRisk"];
    risks: QualityAssessment["risks"];
    evidence: QualityAssessment["evidence"];
    recommendedInspections: QualityAssessment["recommendedInspections"];
    dispositionRecommendation: QualityAssessment["dispositionRecommendation"];
    reasoning: string;
}

export class GeminiQualityProvider implements QualityProvider{
    private readonly ai: GoogleGenAI;

    constructor() {
        const project = process.env.GOOGLE_CLOUD_PROJECT;

        if (!project) {
            throw new Error("GOOGLE_CLOUD_PROJECT environment variable is required");
        }

        this.ai = new GoogleGenAI({
            vertexai: true,
            project,
            location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
        });
    }

    async assess(context: QualityContext): Promise<QualityAssessment> {
        const aiContext = buildQualityAIContext(context);
        const prompt = buildQualityPrompt(aiContext);
        const response = await this.ai.models.generateContent({
            model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseJsonSchema: qualityResponseSchema,
            },
        });

        if (!response.text) {
            throw new Error("Gemini returned an empty quality response");
        }

        let parsed: GeminiQualityResponse;

        try {
            parsed = JSON.parse(response.text) as GeminiQualityResponse;
        } catch {
            throw new Error("Gemini returned invalid JSON");
        }

        return {
            incidentId: context.incident.id,
            machineId: context.machine.id,
            orderId: context.order?.id ?? null,
            incidentSeverity: context.incident.severity,
            overallQualityRisk: parsed.overallQualityRisk,
            risks: parsed.risks,
            evidence: parsed.evidence,
            recommendedInspections: parsed.recommendedInspections,
            dispositionRecommendation: parsed.dispositionRecommendation,
            reasoning: parsed.reasoning,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}