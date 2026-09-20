import type { FactoryState } from "@/types/factory";
import type { DiagnosticGroundTruth } from "@/types/evaluation";

export function resolveDiagnosticGroundTruth(factoryState: FactoryState, machineId: string): DiagnosticGroundTruth | null {
    const scenario = factoryState.activeScenario;

    if (!scenario) {
        return null;
    }

    if (scenario.targetMachineId !== machineId) {
        return null;
    }

    return {
        machineId,
        failureMode: scenario.groundTruth.failureMode,
        rootCause: scenario.groundTruth.rootCause,
    };
}