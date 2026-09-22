import { NextResponse } from "next/server";

import { resetFactory } from "@/lib/simulator/store";
import { clearDiagnosticResults } from "@/lib/agents/diagnostic/result-store";
import { clearQualityResults } from "@/lib/agents/quality/result-store";

export async function POST() {
    const factoryState = resetFactory();
    
    clearDiagnosticResults();
    clearQualityResults();

    return NextResponse.json({
        message: "Factory reset",
        factory: factoryState,
    });
}