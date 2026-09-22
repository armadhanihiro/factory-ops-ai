import { NextResponse } from "next/server";

import { evaluateIncidentQuality } from "@/lib/evaluation/quality-evaluation-service";
import { getFactoryState } from "@/lib/simulator/store";

export async function GET(_request: Request, context: { params: Promise<{ incidentId: string }> }) {
    const { incidentId } = await context.params;
    const factoryState = getFactoryState();
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        return NextResponse.json(
            {
                error: "Incident not found",
            },
            {
                status: 404,
            }
        );
    }

    try {
        const evaluation = await evaluateIncidentQuality(incident);

        return NextResponse.json(evaluation);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to evaluate quality assessment";

        return NextResponse.json(
            {
                error: message,
            },
            {
                status: 409,
            }
        );
    }
}