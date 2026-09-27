import { NextResponse } from "next/server";

import { simulateIncidentRecovery } from "@/lib/recovery/service";
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
        const result = await simulateIncidentRecovery(incidentId, factoryState);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Recovery simulation failed";
        console.error(`Recovery simulation failed for ${incidentId}:`, error);

        return NextResponse.json(
            { error: message },
            { status: 500 },
        );
    }
}