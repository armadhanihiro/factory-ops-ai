import { NextRequest, NextResponse } from "next/server";

import { startScenario } from "@/lib/simulator/store";

import { ScenarioType } from "@/types/factory";

interface ScenarioRequest {
    type: ScenarioType;
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ScenarioRequest;

    if (body.type !== "BEARING_DEGRADATION") {
        return NextResponse.json(
            {
                error: "Scenario is not implemented",
            },
            {
                status: 400,
            },
        );
    }

    const factoryState = startScenario(body.type);

    return NextResponse.json({
        message: "Scenario started",
        scenario: factoryState.activeScenario,
    });
}