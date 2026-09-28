import { GoogleGenAI, Type } from "@google/genai";

import type { PlanTradeoff } from "@/types/decision-support";

import type { DecisionSupportProvider } from "./provider";
import type {
    DecisionSupportContext,
    VerifiedRecoveryPlan,
} from "./types";

const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

function createGeminiClient(): GoogleGenAI {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION;

    if (!project || !location) {
        throw new Error("Google Cloud project and location are required for Gemini decision support");
    }

    return new GoogleGenAI({
        vertexai: true,
        project,
        location,
    });
}

const decisionSupportSchema = {
    type: Type.OBJECT,
    properties: {
        planTradeoffs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    planId: {
                        type: Type.STRING,
                    },
                    summary: {
                        type: Type.STRING,
                    },
                    advantages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                    considerations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                    policyConflictExplanation: {
                        type: Type.STRING,
                        nullable: true,
                    },
                    unknowns: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
                required: [
                    "planId",
                    "summary",
                    "advantages",
                    "considerations",
                    "policyConflictExplanation",
                    "unknowns",
                ],
            },
        },
        supervisorNote: {
            type: Type.STRING,
        },
    },
    required: [
        "planTradeoffs",
        "supervisorNote",
    ],
};

function serializePlan(item: VerifiedRecoveryPlan): string {
    const { plan, policyValidation, simulationOutcome } = item;

    return `
        PLAN ID: ${plan.id}
        NAME: ${plan.name}
        DESCRIPTION: ${plan.description}
        RATIONALE: ${plan.rationale}

        ACTIONS:
        ${plan.actions.map((action) => {
            const details = [
                `type=${action.type}`,
                action.machineId ? `machineId=${action.machineId}` : null,
                action.orderId ? `orderId=${action.orderId}` : null,
                action.targetMachineId ? `targetMachineId=${action.targetMachineId}` : null,
            ].filter(Boolean).join(", ");

            return `- ${details}`;
        }).join("\n")}

        VERIFIED POLICY RESULT:
        compliant=${policyValidation.compliant}
        violations=${policyValidation.violations.length > 0 ? policyValidation.violations.join(" | ") : "NONE"}

        VERIFIED SIMULATION RESULT:
        feasible=${simulationOutcome.feasible}
        constraintViolations=${simulationOutcome.constraintViolations.length > 0 ? simulationOutcome.constraintViolations.join(" | ") : "NONE"}
        productionMachineId=${simulationOutcome.productionMachineId ?? "UNKNOWN"}
        productionCapacityPerHour=${simulationOutcome.productionMachineId ? simulationOutcome.productionCapacityPerHour : "UNKNOWN"}
        remainingUnits=${simulationOutcome.remainingUnits}
        estimatedProductionHours=${simulationOutcome.estimatedProductionHours ?? "UNKNOWN"}
        estimatedInterventionMinutes=${simulationOutcome.estimatedInterventionMinutes ?? "UNKNOWN"}
        estimatedTotalRecoveryMinutes=${simulationOutcome.estimatedTotalRecoveryMinutes ?? "UNKNOWN"}
        qualityHoldRequired=${simulationOutcome.qualityHoldRequired}
        machineInspectionRequired=${simulationOutcome.machineInspectionRequired}
    `.trim();
}

function buildPrompt(context: DecisionSupportContext): string {
    return `
        You are the Decision Support Agent inside Revoryx, an industrial recovery decision-support system.

        Your role is to explain verified recovery-plan trade-offs to a human factory supervisor.

        You DO NOT choose a recovery plan.
        You DO NOT execute actions.
        You DO NOT rank plans.
        You DO NOT override deterministic validation.
        The human supervisor retains final authority.

        INCIDENT
        Incident ID: ${context.incidentId}
        Severity: ${context.incidentSeverity}

        VERIFIED RECOVERY PLANS

        ${context.plans.map((item) => serializePlan(item)).join("\n\n---\n\n")}

        STRICT GROUNDING RULES
        1. Use only facts explicitly provided above.
        2. Treat these fields as authoritative and immutable:
            - feasible
            - constraintViolations
            - compliant
            - policy violations
            - productionMachineId
            - productionCapacityPerHour
            - remainingUnits
            - estimatedProductionHours
            - estimatedInterventionMinutes
            - estimatedTotalRecoveryMinutes
            - qualityHoldRequired
            - machineInspectionRequired
        3. Never calculate new numbers or derive new quantitative estimates.
        4. Never replace UNKNOWN values with estimates.
        5. Never claim that an action has already been executed.
        6. Never describe a policy-conflicting plan as policy-compliant.
        7. Never describe an infeasible plan as feasible.
        8. Explain policy conflicts clearly when present.
        9. Clearly surface unknown information that could affect a supervisor's decision.
        10. Explain qualitative advantages and considerations for every supplied plan.
        11. Do not select, recommend, rank, score, or declare a best, preferred, safest, fastest, or optimal plan.
        12. Do not instruct the supervisor which plan to approve.
        13. Preserve each supplied plan ID exactly.
        14. Return exactly one trade-off explanation for every supplied plan. Do not omit or invent plans.
        15. The supervisor note should summarize the decision context and important uncertainties without recommending a plan.
        16. When explaining a policy conflict, repeat only the supplied policy violation and its direct meaning. Do not infer or invent why the policy was triggered.
        17. Incident severity is context only. Do not claim that severity caused a policy rule unless that causal relationship is explicitly provided.
        18. Do not introduce unsupported causal claims such as "because of severity", "due to safety policy", or "required by regulation" unless those relationships are explicitly supplied.

        Return only the structured response required by the schema.
    `.trim();
}

function validateTradeoffs(tradeoffs: PlanTradeoff[], context: DecisionSupportContext): void {
    if (tradeoffs.length !== context.plans.length) {
        throw new Error("Decision Support returned an unexpected number of plan trade-offs");
    }

    const expectedIds = new Set(context.plans.map((item) => item.plan.id));
    const returnedIds = new Set(tradeoffs.map((item) => item.planId));

    if (returnedIds.size !== tradeoffs.length) {
        throw new Error("Decision Support returned duplicate plan IDs");
    }

    for (const planId of expectedIds) {
        if (!returnedIds.has(planId)) {
            throw new Error(`Decision Support omitted recovery plan ${planId}`);
        }
    }

    for (const planId of returnedIds) {
        if (!expectedIds.has(planId)) {
            throw new Error(`Decision Support invented recovery plan ${planId}`);
        }
    }
}

export class GeminiDecisionSupportProvider implements DecisionSupportProvider{
    async explainTradeoffs(context: DecisionSupportContext): Promise<{ planTradeoffs: PlanTradeoff[]; supervisorNote: string; }> {
        const ai = createGeminiClient();
        const response = await ai.models.generateContent({
            model,
            contents: buildPrompt(context),
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: decisionSupportSchema,
            },
        });

        if (!response.text) {
            throw new Error("Gemini Decision Support returned no response");
        }

        const parsed = JSON.parse(response.text) as {
            planTradeoffs?: PlanTradeoff[];
            supervisorNote?: string;
        };

        if (!parsed.planTradeoffs || typeof parsed.supervisorNote !== "string") {
            throw new Error("Gemini Decision Support returned an invalid response");
        }

        validateTradeoffs(parsed.planTradeoffs, context);

        return {
            planTradeoffs: parsed.planTradeoffs,
            supervisorNote: parsed.supervisorNote,
        };
    }
}