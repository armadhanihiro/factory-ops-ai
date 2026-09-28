import { NextResponse } from "next/server";

import { analyzeIncidentRecovery } from "@/lib/recovery/analysis-service";
import { getFactoryState } from "@/lib/simulator/store";

interface RouteContext {
    params: Promise<{ incidentId: string; }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { incidentId } = await context.params;
        const factoryState = getFactoryState();
        const result = await analyzeIncidentRecovery(incidentId, factoryState);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to analyze recovery plans";

        return NextResponse.json(
            { error: message },
            { status: 400 },
        );
    }
}