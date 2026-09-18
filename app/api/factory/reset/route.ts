import { NextResponse } from "next/server";

import { resetFactory } from "@/lib/simulator/store";

export async function POST() {
    const factoryState = resetFactory();

    return NextResponse.json({
        message: "Factory reset",
        factory: factoryState,
    });
}