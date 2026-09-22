export const qualityResponseSchema = {
    type: "object",
    properties: {
        overallQualityRisk: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH"],
        },
        risks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                    },
                    severity: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH"],
                    },
                    reasoning: {
                        type: "string",
                    },
                },
                required: [
                    "category",
                    "severity",
                    "reasoning",
                ],
                additionalProperties: false,
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
                    observation: {
                        type: "string",
                    },
                    significance: {
                        type: "string",
                    },
                },
                required: [
                    "metric",
                    "observation",
                    "significance",
                ],
                additionalProperties: false,
            },
        },
        recommendedInspections: {
            type: "array",
            items: {
                type: "string",
            },
        },
        dispositionRecommendation: {
            type: "string",
            enum: [
                "CONTINUE_MONITORING",
                "HOLD_FOR_INSPECTION",
                "QUARANTINE_RECOMMENDED",
            ],
        },
        reasoning: {
            type: "string",
        },
    },
    required: [
        "overallQualityRisk",
        "risks",
        "evidence",
        "recommendedInspections",
        "dispositionRecommendation",
        "reasoning",
    ],
    additionalProperties: false,
};