import { NextResponse } from "next/server";

import { getFactoryState } from "@/lib/simulator/store";
import { buildDiagnosticContext } from "@/lib/agents/diagnostic/context-builder";
import { buildDiagnosticPrompt } from "@/lib/agents/diagnostic/prompt";

export async function GET(_request: Request, context: { params: Promise<{ incidentId: string }> }) {
    const { incidentId } = await context.params;
    const factoryState = getFactoryState();
    const incident = factoryState.incidents.find((item) => item.id === incidentId);

    if (!incident) {
        return NextResponse.json(
            { error: "Incident not found" },
            { status: 404 }
        );
    }

    const diagnosticContext = buildDiagnosticContext(incident, factoryState);
    const prompt = buildDiagnosticPrompt(diagnosticContext);

    return NextResponse.json({
        context: diagnosticContext,
        prompt,
    });
}