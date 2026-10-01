import { NextResponse } from "next/server";

import { executeRecoveryApproval } from "@/lib/execution/service";

interface RouteContext {
    params: Promise<{ approvalId: string; }>;
}

export async function POST(_request: Request, context: RouteContext) {
    try {
        const { approvalId } = await context.params;

        const result = await executeRecoveryApproval(approvalId);

        if (!result.executed) {
            return NextResponse.json(
                result,
                { 
                    status: 409 
                },
            );
        }

        return NextResponse.json(
            result,
            { 
                status: 200 
            },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown execution error";

        return NextResponse.json(
            {
                error: message,
            },
            {
                status: 400,
            },
        );
    }
}