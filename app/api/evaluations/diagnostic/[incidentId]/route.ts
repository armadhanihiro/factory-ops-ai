import { NextResponse } from "next/server";
import { getFactoryState } from "@/lib/simulator/store";
import { evaluateIncidentDiagnosis } from "@/lib/evaluation/diagnostic-evaluation-service";

interface RouteContext {
    params: Promise<{
        incidentId: string;
    }>;
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { incidentId } = await context.params;
        const factoryState = getFactoryState();
        const incident = factoryState.incidents.find((item) => item.id === incidentId);

        if (!incident) {
            return NextResponse.json(
                { error: `Incident ${incidentId} not found` },
                { status: 404 }
            );
        }

        const evaluation = await evaluateIncidentDiagnosis(incident, factoryState);

        return NextResponse.json(evaluation);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown evaluation error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}