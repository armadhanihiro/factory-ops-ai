import { NextResponse } from "next/server";

import { getOrCreateProductionAssessment } from "@/lib/agents/production/service";
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
        const assessment = await getOrCreateProductionAssessment(incidentId, factoryState);

        return NextResponse.json(assessment);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Production assessment failed";

        return NextResponse.json(
            { error: message },
            { status: 409 },
        );
    }
}