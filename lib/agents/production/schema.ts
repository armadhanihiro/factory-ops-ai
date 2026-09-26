export const productionResponseSchema = {
    type: "object",

    properties: {
        impactLevel: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },

        alternatives: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    machineId: {
                        type: "string",
                    },
                    available: {
                        type: "boolean",
                    },
                    capacity: {
                        type: "number",
                    },
                    reasoning: {
                        type: "string",
                    },
                },
                required: [
                    "machineId",
                    "available",
                    "capacity",
                    "reasoning",
                ],
            },
        },

        evidence: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    metric: {
                        type: "string",
                    },
                    value: {
                        type: "string",
                    },
                    significance: {
                        type: "string",
                    },
                },
                required: [
                    "metric",
                    "value",
                    "significance",
                ],
            },
        },

        recommendedStrategy: {
            type: "string",
            enum: [
                "CONTINUE_CURRENT_PLAN",
                "PREPARE_BACKUP_CAPACITY",
                "REROUTE_RECOMMENDED",
                "PAUSE_AND_REPLAN",
            ],
        },

        reasoning: {
            type: "string",
        },
    },

    required: [
        "impactLevel",
        "alternatives",
        "evidence",
        "recommendedStrategy",
        "reasoning",
    ],
} as const;