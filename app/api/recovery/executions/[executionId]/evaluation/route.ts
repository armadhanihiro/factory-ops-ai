import { NextResponse } from "next/server";

import {
    evaluateRecoveryExecutionById,
} from "@/lib/recovery-evaluation/service";

interface RouteContext {
    params: Promise<{ executionId: string; }>;
}

export async function POST(_request: Request, context: RouteContext) {
    try {
        const { executionId } = await context.params;
        const evaluation = evaluateRecoveryExecutionById(executionId);

        return NextResponse.json(
            evaluation,
            {
                status: 200,
            },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown recovery evaluation error";

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