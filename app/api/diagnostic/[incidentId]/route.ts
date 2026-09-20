import { NextResponse } from "next/server";

import { getFactoryState } from "@/lib/simulator/store";
import { DiagnosticAgent } from "@/lib/agents/diagnostic/agent";

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

    const agent = new DiagnosticAgent();
    const diagnosis = await agent.investigate(incident, factoryState);

    return NextResponse.json(diagnosis);
}