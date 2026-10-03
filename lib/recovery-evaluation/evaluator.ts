import type { FactoryState } from "@/types/factory";
import type { RecoveryExecution } from "@/types/execution";
import type { RecoveryPlan } from "@/types/recovery";
import type {
    RecoveryActionEvaluation,
    RecoveryEvaluation,
    RecoveryEvaluationOutcome,
} from "@/types/recovery-evaluation";

function evaluateActions(execution: RecoveryExecution): RecoveryActionEvaluation[] {
    const after = execution.factoryStateAfter;

    return execution.actionResults.map((result) => {
        const action = result.action;

        if (result.status !== "EXECUTED") {
            return {
                actionIndex: result.actionIndex,
                actionType: action.type,
                achieved: false,
                observation: result.message,
            };
        }

        switch (action.type) {
            case "PAUSE_MACHINE": {
                const machine = after.machines.find((item) => item.id === action.machineId);
                const achieved = machine?.status === "IDLE" || machine?.status === "MAINTENANCE";

                return {
                    actionIndex: result.actionIndex,
                    actionType: action.type,
                    achieved,
                    observation: achieved ? `Machine ${action.machineId} is not running` : `Machine ${action.machineId} did not reach a paused state`,
                };
            }

            case "INSPECT_MACHINE": {
                const machine = after.machines.find((item) => item.id === action.machineId);
                const achieved = machine?.status === "MAINTENANCE";

                return {
                    actionIndex: result.actionIndex,
                    actionType: action.type,
                    achieved,
                    observation: achieved ? `Machine ${action.machineId} is in MAINTENANCE` : `Machine ${action.machineId} is not in MAINTENANCE`,
                };
            }

            case "HOLD_OUTPUT": {
                const order = after.orders.find((item) => item.id === action.orderId);
                const achieved = order?.status === "AT_RISK";

                return {
                    actionIndex: result.actionIndex,
                    actionType: action.type,
                    achieved,
                    observation: achieved ? `Order ${action.orderId} output is held` : `Order ${action.orderId} output is not held`,
                };
            }

            case "REROUTE_ORDER": {
                const order = after.orders.find((item) => item.id === action.orderId);
                const achieved = order?.assignedMachineId === action.targetMachineId;

                return {
                    actionIndex: result.actionIndex,
                    actionType: action.type,
                    achieved,
                    observation: achieved ? `Order ${action.orderId} is assigned to ${action.targetMachineId}` : `Order ${action.orderId} was not rerouted to ${action.targetMachineId}`,
                };
            }

            case "CONTINUE_PRODUCTION": {
                const machine = after.machines.find((item) => item.id === action.machineId);
                const achieved = machine?.status === "RUNNING";

                return {
                    actionIndex: result.actionIndex,
                    actionType: action.type,
                    achieved,
                    observation: achieved ? `Machine ${action.machineId} remains RUNNING` : `Machine ${action.machineId} is not RUNNING`,
                };
            }
        }
    });
}

function determineOutcome(achieved: number, expected: number): RecoveryEvaluationOutcome {
    if (expected > 0 && achieved === expected) {
        return "RECOVERY_ACTIONS_ACHIEVED";
    }

    if (achieved > 0) {
        return "RECOVERY_ACTIONS_PARTIALLY_ACHIEVED";
    }

    return "RECOVERY_ACTIONS_FAILED";
}

function determineActualProductionMachine(plan: RecoveryPlan, state: FactoryState): string | null {
    const reroute = plan.actions.find((action) => action.type === "REROUTE_ORDER");

    if (reroute?.orderId) {
        const order = state.orders.find((item) => item.id === reroute.orderId);

        return order?.assignedMachineId ?? null;
    }

    const affectedMachine = state.machines.find((item) => item.id === plan.machineId);

    return affectedMachine?.status === "RUNNING" ? affectedMachine.id : null;
}

export function evaluateRecoveryExecution(execution: RecoveryExecution, plan: RecoveryPlan): RecoveryEvaluation {
    const prediction = execution.predictionSnapshot;
    
    if (execution.planId !== plan.id) {
        throw new Error(`Execution plan ${execution.planId} does not match ${plan.id}`);
    }

    if (prediction.planId !== plan.id) {
        throw new Error(`Prediction plan ${prediction.planId} does not match ${plan.id}`);
    }

    const actionEvaluations = evaluateActions(execution);
    const achievedActions = actionEvaluations.filter((item) => item.achieved).length;
    const holdActions = plan.actions.filter((action) => action.type === "HOLD_OUTPUT");
    const actualQualityHold = holdActions.length > 0 && holdActions.every((action) => {
        const order = execution.factoryStateAfter.orders.find((item) => item.id === action.orderId);
        return order?.status === "AT_RISK";
    });
    const inspectionActions = plan.actions.filter((action) => action.type === "INSPECT_MACHINE");
    const actualInspection = inspectionActions.length > 0 && inspectionActions.every((action) => {
        const machine = execution.factoryStateAfter.machines.find((item) => item.id === action.machineId);
        return machine?.status === "MAINTENANCE";
    });

    const actualProductionMachineId = determineActualProductionMachine(plan, execution.factoryStateAfter);
    const productionMachineMatched = prediction.productionMachineId === actualProductionMachineId;
    const qualityHoldMatched = prediction.qualityHoldRequired === actualQualityHold;
    const inspectionMatched = prediction.machineInspectionRequired === actualInspection;
    const predictionMatches = [
        productionMachineMatched,
        qualityHoldMatched,
        inspectionMatched,
    ];
    const matchedPredictions = predictionMatches.filter(Boolean).length;

    return {
        id: `EVALUATION-${execution.id}`,
        executionId: execution.id,
        incidentId: execution.incidentId,
        planId: execution.planId,
        expectedActions: execution.actionResults.length,
        achievedActions,
        actionEvaluations,
        predictionComparison: {
            expectedProductionMachineId: prediction.productionMachineId,
            actualProductionMachineId,
            productionMachineMatched,
            expectedQualityHold: prediction.qualityHoldRequired,
            actualQualityHold,
            qualityHoldMatched,
            expectedInspection: prediction.machineInspectionRequired,
            actualInspection,
            inspectionMatched,
            matchedPredictions,
            totalPredictions: predictionMatches.length,
        },
        outcome: determineOutcome(achievedActions, execution.actionResults.length),
        evaluatedAt: new Date().toISOString(),
    };
}