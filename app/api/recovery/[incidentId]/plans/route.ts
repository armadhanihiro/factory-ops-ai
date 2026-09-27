import { NextResponse } from "next/server";

import { getFactoryState } from "@/lib/simulator/store";
import { getOrCreateRecoveryPlans } from "@/lib/agents/recovery-planner/service";

interface RouteContext {
    params: Promise<{ incidentId: string; }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { incidentId } = await context.params;
        const factoryState = getFactoryState();
        const result = await getOrCreateRecoveryPlans(incidentId, factoryState);

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate recovery plans";

        return NextResponse.json(
            { error: message },
            { status: 400 },
        );
    }
}