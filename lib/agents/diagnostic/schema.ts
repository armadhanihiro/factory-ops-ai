export const diagnosticResponseSchema = {
    type: "object",
    properties: {
        primaryDiagnosis: {
            type: "object",
            properties: {
                failureMode: {
                    type: "string",
                },
                confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                },
                reasoning: {
                    type: "string",
                },
            },
            required: [
                "failureMode",
                "confidence",
                "reasoning",
            ],
            additionalProperties: false,
        },

        alternativeHypotheses: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    failureMode: {
                        type: "string",
                    },
                    confidence: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                    },
                    reasoning: {
                        type: "string",
                    },
                },
                required: [
                    "failureMode",
                    "confidence",
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

        recommendedChecks: {
            type: "array",
            items: {
                type: "string",
            },
        },
    },

    required: [
        "primaryDiagnosis",
        "alternativeHypotheses",
        "evidence",
        "recommendedChecks",
    ],

    additionalProperties: false,
} as const;