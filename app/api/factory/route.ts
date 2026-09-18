import { NextResponse } from "next/server";

import { createInitialFactoryState } from "@/lib/simulator/factory";
import { tickFactory } from "@/lib/simulator/telemetry";

let factoryState = createInitialFactoryState();

export async function GET() {
    factoryState = tickFactory(factoryState);

    return NextResponse.json(factoryState);
}