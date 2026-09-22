import { NextResponse } from "next/server";

import { getOrCreateMaintenanceAssessment } from "@/lib/agents/maintenance/service";
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
        const assessment = await getOrCreateMaintenanceAssessment(incident, factoryState);

        return NextResponse.json(assessment);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to assess maintenance needs";

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