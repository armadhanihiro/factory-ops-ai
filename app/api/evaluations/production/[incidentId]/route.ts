import { NextResponse } from "next/server";

import { evaluateCachedProductionAssessment } from "@/lib/evaluation/production-evaluation-service";
import { getFactoryState } from "@/lib/simulator/store";

interface RouteContext {
    params: Promise<{ incidentId: string; }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const { incidentId } = await context.params;
    const factoryState = getFactoryState();
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        return NextResponse.json(
            {
                error: `Incident not found: ${incidentId}`,
            },
            { status: 404 },
        );
    }

    try {
        const evaluation = evaluateCachedProductionAssessment(incidentId, factoryState);

        return NextResponse.json(evaluation);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Production evaluation failed";

        return NextResponse.json(
            { error: message },
            { status: 409 },
        );
    }
}