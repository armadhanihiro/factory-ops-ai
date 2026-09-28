import { NextResponse } from "next/server";

import { getOrCreateDecisionSupport } from "@/lib/agents/decision-support/service";
import { getFactoryState } from "@/lib/simulator/store";

interface RouteContext {
    params: Promise<{ incidentId: string; }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { incidentId } = await context.params;
        const factoryState = getFactoryState();
        const result = await getOrCreateDecisionSupport(incidentId, factoryState);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate decision support";

        return NextResponse.json(
            { error: message },
            { status: 400 },
        );
    }
}