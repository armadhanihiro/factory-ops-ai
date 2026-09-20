import { NextResponse } from "next/server";

import { advanceFactory } from "@/lib/simulator/store";
import { toPublicFactoryState } from "@/lib/simulator/public-state";

export async function GET() {
  const factoryState = advanceFactory();

  return NextResponse.json(toPublicFactoryState(factoryState),);
}