export interface FailureModeDefinition {
    canonical: string;
    exactTerms: string[];
    relatedTerms: string[];
}

const failureModes: FailureModeDefinition[] = [
    {
        canonical: "bearing_degradation",

        exactTerms: [
            "bearing degradation",
            "bearing wear",
            "worn bearing",
            "worn bearings",
            "bearing failure",
            "failing bearing",
            "failing bearings",
        ],

        relatedTerms: [
            "mechanical wear",
            "mechanical component wear",
            "mechanical failure",
        ],
    },
];

function normalize(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function scoreFailureMode(predicted: string, expected: string): number {
    const normalizedPredicted = normalize(predicted);
    const normalizedExpected = normalize(expected);

    if (normalizedPredicted === normalizedExpected) {
        return 1;
    }

    const definition = failureModes.find((item) => normalize(item.canonical) === normalizedExpected);

    if (!definition) {
        return 0;
    }

    const exactMatch = definition.exactTerms.some((term) => normalizedPredicted.includes(normalize(term)));

    if (exactMatch) {
        return 1;
    }

    const relatedMatch = definition.relatedTerms.some((term) => normalizedPredicted.includes(normalize(term)));

    if (relatedMatch) {
        return 0.5;
    }

    return 0;
}