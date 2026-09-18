import { NextResponse } from "next/server";

import { advanceFactory } from "@/lib/simulator/store";

export async function GET() {
  const factoryState = advanceFactory();

  return NextResponse.json(factoryState);
}