import { NextResponse } from "next/server";

import { QualityAgent } from "@/lib/agents/quality/agent";
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

    const agent = new QualityAgent();
    const assessment = await agent.assessImpact( incident, factoryState);

    return NextResponse.json(assessment);
}