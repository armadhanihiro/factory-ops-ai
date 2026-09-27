import type { RecoveryPlan } from "@/types/recovery";

import type { RecoveryPlannerContext } from "./types";

export interface RecoveryPlannerProvider {
    generatePlans(context: RecoveryPlannerContext): Promise<RecoveryPlan[]>;
}