import { GoogleGenAI } from "@google/genai";

import type { ProductionAssessment } from "@/types/production";

import { buildProductionAIContext } from "./ai-context";
import { buildProductionFacts } from "./production-facts";
import { buildProductionPrompt } from "./prompt";
import { productionResponseSchema } from "./schema";
import type {
    ProductionContext,
    ProductionProvider,
} from "./types";

type GeminiProductionResponse = Pick<
    ProductionAssessment,
    | "impactLevel"
    | "alternatives"
    | "evidence"
    | "recommendedStrategy"
    | "reasoning"
>;

export class GeminiProductionProvider implements ProductionProvider{
    async assess(context: ProductionContext): Promise<ProductionAssessment> {
        const project = process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
        const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

        if (!project) {
            throw new Error("GOOGLE_CLOUD_PROJECT is required for Gemini production provider");
        }

        const ai = new GoogleGenAI({
            vertexai: true,
            project,
            location,
        });

        const facts = buildProductionFacts(context);
        const aiContext = buildProductionAIContext(context);
        const prompt = buildProductionPrompt(aiContext);

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: productionResponseSchema,
                temperature: 0.2,
            },
        });

        if (!response.text) {
            throw new Error("Gemini returned an empty production assessment");
        }

        const parsed = JSON.parse(response.text) as GeminiProductionResponse;

        /*
        * Do not trust Gemini copies of machine availability
        * or capacity. Re-attach deterministic values here.
        */
        const alternatives = facts.alternatives.map((alternative) => {
            const aiAlternative = parsed.alternatives.find((item) => item.machineId === alternative.machineId);

            return {
                machineId: alternative.machineId,
                available: alternative.available,
                capacity: alternative.capacity,
                reasoning: aiAlternative?.reasoning ?? "No additional AI reasoning provided.",
            };
        });

        return {
            incidentId: context.incident.id,
            machineId: context.affectedMachine.id,
            incidentSeverity: context.incident.severity,
            affectedOrderId: facts.affectedOrderId,
            impactLevel: parsed.impactLevel,
            remainingUnits: facts.remainingUnits,
            currentMachineCapacity: facts.currentMachineCapacity,
            productionAtRisk: facts.productionAtRisk,
            alternatives,
            evidence: parsed.evidence,
            recommendedStrategy: parsed.recommendedStrategy,
            reasoning: parsed.reasoning,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}