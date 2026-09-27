import type { FactoryState, Incident } from "@/types/factory";
import type { CrossFunctionalAnalysis } from "@/types/orchestrator";

export interface RecoverySimulationContext {
    incident: Incident;
    factoryState: FactoryState;
    analysis: CrossFunctionalAnalysis;
}