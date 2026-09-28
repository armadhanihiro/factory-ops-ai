import { NextResponse } from "next/server";

import { requestRecoveryApproval } from "@/lib/approval/service";
import { getFactoryState } from "@/lib/simulator/store";

interface RouteContext {
    params: Promise<{ incidentId: string; }>;
}

interface RequestBody {
    planId?: string;
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const { incidentId } = await context.params;
        const body = (await request.json()) as RequestBody;

        if (!body.planId) {
            return NextResponse.json(
                {
                    error: "planId is required",
                },
                { status: 400 },
            );
        }

        const factoryState = getFactoryState();
        const result = await requestRecoveryApproval(incidentId, body.planId, factoryState);

        return NextResponse.json(
            result,
            {
                status: result.eligibleForApproval ? 201 : 409,
            },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to request recovery approval";

        return NextResponse.json(
            { error: message },
            { status: 400 },
        );
    }
}