import { NextResponse } from "next/server";

import { DiagnosticAgent } from "@/lib/agents/diagnostic/agent";
import { getDiagnosticResult, saveDiagnosticResult } from "@/lib/agents/diagnostic/result-store";
import { getFactoryState } from "@/lib/simulator/store";

export async function GET(_request: Request, context: { params: Promise<{ incidentId: string; }> }) {
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

    const cachedDiagnosis = getDiagnosticResult(incidentId);

    if (cachedDiagnosis) {
        return NextResponse.json(cachedDiagnosis);
    }

    const agent = new DiagnosticAgent();
    const diagnosis = await agent.investigate(incident, factoryState);

    saveDiagnosticResult(diagnosis);

    return NextResponse.json(diagnosis);
}