export const maintenanceResponseSchema = {
    type: "object",
    properties: {
        urgency: {
            type: "string",
            enum: ["MONITOR", "SCHEDULE_SOON", "URGENT"],
        },
        suspectedFailureMode: {
            type: "string",
        },
        evidence: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    source: {
                        type: "string",
                        enum: ["INCIDENT", "DIAGNOSIS"],
                    },
                    observation: {
                        type: "string",
                    },
                    significance: {
                        type: "string",
                    },
                },
                required: ["source", "observation", "significance"],
            },
        },
        recommendedTasks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    task: {
                        type: "string",
                    },
                    purpose: {
                        type: "string",
                    },
                    priority: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH"],
                    },
                },
                required: ["task", "purpose", "priority"],
            },
        },
        estimatedInterventionMinutes: {
            type: ["number", "null"],
        },
        requiredSkills: {
            type: "array",
            items: {
                type: "string",
            },
        },
        partsToInspect: {
            type: "array",
            items: {
                type: "string",
            },
        },
        operationalRecommendation: {
            type: "string",
            enum: [
                "CONTINUE_WITH_MONITORING",
                "PLAN_MAINTENANCE",
                "IMMEDIATE_INSPECTION_RECOMMENDED",
            ],
        },
        reasoning: {
            type: "string",
        },
    },

    required: [
        "urgency",
        "suspectedFailureMode",
        "evidence",
        "recommendedTasks",
        "estimatedInterventionMinutes",
        "requiredSkills",
        "partsToInspect",
        "operationalRecommendation",
        "reasoning",
    ],
} as const;