import { NextResponse } from "next/server";

import { clearDiagnosticResults } from "@/lib/agents/diagnostic/result-store";
import { clearDecisionSupportResults } from "@/lib/agents/decision-support/result-store";
import { clearMaintenanceResults } from "@/lib/agents/maintenance/result-store";
import { clearProductionResults } from "@/lib/agents/production/result-store";
import { clearQualityResults } from "@/lib/agents/quality/result-store";
import { clearRecoveryPlannerResults } from "@/lib/agents/recovery-planner/result-store";
import { clearRecoveryApprovals } from "@/lib/approval/store";
import { clearRecoveryExecutions } from "@/lib/execution/store";
import { clearOrchestrationResults } from "@/lib/orchestrator/result-store";
import { clearRecoveryEvaluations } from "@/lib/recovery-evaluation/store";
import { resetFactory } from "@/lib/simulator/store";

export async function POST() {
    const factoryState = resetFactory();

    clearDiagnosticResults();
    clearQualityResults();
    clearMaintenanceResults();
    clearProductionResults();
    clearOrchestrationResults();
    clearRecoveryPlannerResults();
    clearDecisionSupportResults();
    clearRecoveryApprovals();
    clearRecoveryExecutions();
    clearRecoveryEvaluations();

    return NextResponse.json({
        message: "Factory reset",
        factory: factoryState,
    });
}