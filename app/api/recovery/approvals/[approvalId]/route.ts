import { NextResponse } from "next/server";

import {
    approveRecoveryPlan,
    rejectRecoveryPlan,
} from "@/lib/approval/service";

interface RouteContext {
    params: Promise<{ approvalId: string; }>;
}

interface DecisionBody {
    decision?: "APPROVE" | "REJECT";
    supervisorNote?: string;
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const { approvalId } = await context.params;
        const body = (await request.json()) as DecisionBody;

        if (body.decision !== "APPROVE" && body.decision !== "REJECT") {
            return NextResponse.json(
                {
                    error: "decision must be APPROVE or REJECT",
                },
                { status: 400 },
            );
        }

        const approval =  body.decision === "APPROVE" ? approveRecoveryPlan(approvalId, body.supervisorNote,) : rejectRecoveryPlan(approvalId, body.supervisorNote);

        return NextResponse.json(approval);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to process recovery approval";

        return NextResponse.json(
            { error: message },
            { status: 400 },
        );
    }
}