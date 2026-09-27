import { GoogleGenAI, Type } from "@google/genai";

import type { RecoveryPlan } from "@/types/recovery";

import type { RecoveryPlannerProvider } from "./provider";
import type { RecoveryPlannerContext } from "./types";

const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const ai = new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
});

const recoveryPlannerSchema = {
    type: Type.OBJECT,
    properties: {
        plans: {
            type: Type.ARRAY,
            minItems: 2,
            maxItems: 3,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.STRING,
                    },
                    name: {
                        type: Type.STRING,
                    },
                    description: {
                        type: Type.STRING,
                    },
                    rationale: {
                        type: Type.STRING,
                    },
                    actions: {
                        type: Type.ARRAY,
                        minItems: 1,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: [
                                        "CONTINUE_PRODUCTION",
                                        "PAUSE_MACHINE",
                                        "INSPECT_MACHINE",
                                        "REROUTE_ORDER",
                                        "HOLD_OUTPUT",
                                    ],
                                },
                                machineId: {
                                    type: Type.STRING,
                                },
                                orderId: {
                                    type: Type.STRING,
                                },
                                targetMachineId: {
                                    type: Type.STRING,
                                },
                                reasoning: {
                                    type: Type.STRING,
                                },
                            },
                            required: [
                                "type",
                                "reasoning",
                            ],
                        },
                    },
                },
                required: [
                    "id",
                    "name",
                    "description",
                    "rationale",
                    "actions",
                ],
            },
        },
    },
    required: ["plans"],
};

function buildPrompt(context: RecoveryPlannerContext): string {
    const { analysis } = context;

    return `
        You are the Recovery Planning Agent inside Revoryx, an industrial decision-support system.

        Your responsibility is to propose 2 to 3 distinct recovery strategies for a factory incident.

        You propose actions only.
        You DO NOT execute actions.
        A deterministic simulator will validate every plan and calculate operational outcomes after you respond.
        A human supervisor retains final authority.

        INCIDENT
        Incident ID: ${context.incidentId}
        Affected machine: ${context.machineId}
        Severity: ${analysis.incidentSeverity}
        Affected order: ${context.affectedOrderId}

        DIAGNOSTIC ASSESSMENT
        Primary failure mode: ${analysis.diagnosis.primaryDiagnosis.failureMode}
        Confidence: ${analysis.diagnosis.primaryDiagnosis.confidence}
        Reasoning: ${analysis.diagnosis.primaryDiagnosis.reasoning}
        Recommended checks: ${analysis.diagnosis.recommendedChecks.map((check) => `- ${check}`).join("\n")}

        QUALITY ASSESSMENT
        Overall quality risk: ${analysis.quality.overallQualityRisk}
        Disposition recommendation: ${analysis.quality.dispositionRecommendation}
        Reasoning: ${analysis.quality.reasoning}
        Recommended inspections: ${analysis.quality.recommendedInspections.map((inspection) => `- ${inspection}`).join("\n")}

        MAINTENANCE ASSESSMENT
        Urgency: ${analysis.maintenance.urgency}
        Suspected failure mode: ${analysis.maintenance.suspectedFailureMode}
        Operational recommendation: ${analysis.maintenance.operationalRecommendation}
        Estimated intervention minutes: ${analysis.maintenance.estimatedInterventionMinutes ?? "UNKNOWN"}
        Reasoning: ${analysis.maintenance.reasoning}
        Recommended tasks: ${analysis.maintenance.recommendedTasks.map((task) => `- ${task.task} [${task.priority}]: ${task.purpose}`).join("\n")}

        PRODUCTION ASSESSMENT
        Impact level: ${analysis.production.impactLevel}
        Production at risk: ${analysis.production.productionAtRisk}
        Recommended strategy: ${analysis.production.recommendedStrategy}

        VERIFIED PRODUCTION ALTERNATIVES
        ${analysis.production.alternatives.map((alternative) => 
            `- ${alternative.machineId}: available=${alternative.available}, capacity=${alternative.capacity}`
        ).join("\n")}

        ALLOWED ACTIONS
        - CONTINUE_PRODUCTION
        - PAUSE_MACHINE
        - INSPECT_MACHINE
        - REROUTE_ORDER
        - HOLD_OUTPUT

        STRICT RULES
        1. Use only the incident ID, machine ID, order ID, and alternative machine IDs supplied above.
        2. Never invent machines, orders, incidents, capacities, durations, quantities, or operational facts.
        3. Do not calculate or predict:
            - production completion time
            - downtime
            - recovery duration
            - production loss
            - throughput outcome
            - financial impact
        4. Do not claim that a plan is mathematically optimal, fastest, safest, or best.
        5. Do not execute or claim that any operational action has already occurred.
        6. PAUSE_MACHINE, INSPECT_MACHINE, and CONTINUE_PRODUCTION must target the affected machine.
        7. REROUTE_ORDER must:
            - originate from the affected machine
            - target the affected order
            - use only a supplied production alternative
        8. HOLD_OUTPUT must target the affected order.
        9. Do not treat a maintenance recommendation as proof that the machine has already stopped or changed status.
        10. Produce distinct strategies with meaningful operational trade-offs when supported by the supplied evidence.
        11. Your rationale may explain qualitative trade-offs, but deterministic calculations are handled by another system.
        12. Do not fabricate missing intervention duration. If it is UNKNOWN, leave quantitative recovery reasoning to the simulator.

        Return only the structured response required by the schema.
    `.trim();
}

function normalizePlans(plans: RecoveryPlan[], context: RecoveryPlannerContext): RecoveryPlan[] {
    return plans.map((plan, index) => ({
        ...plan,

        /*
         * These identifiers are deterministic context,
         * not values we trust the model to decide.
         */
        id: `RECOVERY-${context.incidentId}-${index + 1}`,
        incidentId: context.incidentId,
        machineId: context.machineId,
    }));
}

export class GeminiRecoveryPlannerProvider implements RecoveryPlannerProvider{
    async generatePlans(context: RecoveryPlannerContext): Promise<RecoveryPlan[]> {
        const response = await ai.models.generateContent({
            model,
            contents: buildPrompt(context),
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: recoveryPlannerSchema,
            },
        });

        if (!response.text) {
            throw new Error("Gemini Recovery Planner returned no response");
        }

        const parsed = JSON.parse(response.text) as {
            plans?: RecoveryPlan[];
        };

        if (!parsed.plans || parsed.plans.length === 0) {
            throw new Error("Gemini Recovery Planner returned no plans");
        }

        return normalizePlans( parsed.plans, context);
    }
}