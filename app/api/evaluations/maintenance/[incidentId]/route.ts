import { NextResponse } from "next/server";

import { getFactoryState } from "@/lib/simulator/store";
import { evaluateCachedMaintenanceAssessment } from "@/lib/evaluation/maintenance-evaluation-service";

interface RouteContext { params: Promise<{ incidentId: string; }> }

export async function GET(_request: Request, context: RouteContext) {
    const { incidentId } = await context.params;

    try {
        const factoryState = getFactoryState();
        const evaluation = evaluateCachedMaintenanceAssessment(incidentId, factoryState);

        return NextResponse.json(evaluation);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Maintenance evaluation failed";

        if (message.startsWith("Incident not found")) {
            return NextResponse.json(
                { error: message },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { error: message },
            { status: 409 },
        );
    }
}