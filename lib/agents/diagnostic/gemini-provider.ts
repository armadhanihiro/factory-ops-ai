import { GoogleGenAI } from "@google/genai";

import type { DiagnosticResult } from "@/types/diagnostic";

import type {
    DiagnosticContext,
    DiagnosticProvider,
} from "./types";

import { buildDiagnosticContext } from "./context-builder";
import { buildDiagnosticPrompt } from "./prompt";
import { diagnosticResponseSchema } from "./schema";

interface GeminiDiagnosticResponse {
    primaryDiagnosis: DiagnosticResult["primaryDiagnosis"];
    alternativeHypotheses: DiagnosticResult["alternativeHypotheses"];
    evidence: DiagnosticResult["evidence"];
    recommendedChecks: DiagnosticResult["recommendedChecks"];
}

export class GeminiDiagnosticProvider implements DiagnosticProvider {
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

    async diagnose(context: DiagnosticContext): Promise<DiagnosticResult> {
        const diagnosticContext = buildDiagnosticContext(context.incident, context.factoryState);
        const prompt = buildDiagnosticPrompt(diagnosticContext);
        const response = await this.ai.models.generateContent({
            model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseJsonSchema: diagnosticResponseSchema,
            },
        });

        if (!response.text) {
            throw new Error("Gemini returned an empty diagnostic response");
        }

        let parsed: GeminiDiagnosticResponse;

        try {
            parsed = JSON.parse(response.text) as GeminiDiagnosticResponse;
        } catch {
            throw new Error("Gemini returned invalid JSON");
        }

        return {
            incidentId: context.incident.id,
            machineId: context.incident.machineId,
            severity: context.incident.severity,
            primaryDiagnosis: parsed.primaryDiagnosis,
            alternativeHypotheses: parsed.alternativeHypotheses,
            evidence: parsed.evidence,
            recommendedChecks: parsed.recommendedChecks,
            generatedAt: new Date().toISOString(),
            provider: "gemini",
        };
    }
}