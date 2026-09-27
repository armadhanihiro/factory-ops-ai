import type { RecoveryAction, RecoveryPlan, RecoverySimulationOutcome, RecoverySimulationResult } from "@/types/recovery";

import type { RecoverySimulationContext } from "./types";

function calculateProductionHours(remainingUnits: number, capacityPerHour: number): number | null {
    if (capacityPerHour <= 0) {
        return null;
    }

    return remainingUnits / capacityPerHour;
}

function findRerouteAction(plan: RecoveryPlan) {
    return plan.actions.find((action) => action.type === "REROUTE_ORDER");
}

function hasAction(plan: RecoveryPlan, type: RecoveryPlan["actions"][number]["type"]): boolean {
    return plan.actions.some((action) => action.type === type);
}

/*
 * Validate that an AI-generated recovery plan only targets
 * resources that belong to the current incident.
 *
 * This prevents hallucinated machine/order identifiers from
 * entering the deterministic simulation layer.
 */
function validatePlanTargets(plan: RecoveryPlan, context: RecoverySimulationContext): string[] {
    const violations: string[] = [];
    const incident = context.incident;
    const production = context.analysis.production;

    if (plan.incidentId !== incident.id) {
        violations.push(`Plan incident ${plan.incidentId} does not match ${incident.id}`);
    }

    if (plan.machineId !== incident.machineId) {
        violations.push(`Plan machine ${plan.machineId} does not match affected machine ${incident.machineId}`);
    }

    for (const action of plan.actions) {
        validateActionTarget(action, incident.machineId, production.affectedOrderId, violations);
    }

    return violations;
}

function validateActionTarget(action: RecoveryAction, affectedMachineId: string, affectedOrderId: string | null, violations: string[]): void {
    switch (action.type) {
        case "CONTINUE_PRODUCTION":
        case "PAUSE_MACHINE":
        case "INSPECT_MACHINE": {
            if (action.machineId !== affectedMachineId) {
                violations.push(`${action.type} must target affected machine ${affectedMachineId}`);
            }

            break;
        }

        case "HOLD_OUTPUT": {
            if (!affectedOrderId) {
                violations.push("HOLD_OUTPUT cannot be used because there is no affected order");
                break;
            }

            if (action.orderId !== affectedOrderId) {
                violations.push(`HOLD_OUTPUT must target affected order ${affectedOrderId}`);
            }

            break;
        }

        case "REROUTE_ORDER": {
            if (!affectedOrderId) {
                violations.push("REROUTE_ORDER cannot be used because there is no affected order");
                break;
            }

            if (action.orderId !== affectedOrderId) {
                violations.push(`REROUTE_ORDER must target affected order ${affectedOrderId}`);
            }

            if (action.machineId !== affectedMachineId) {
                violations.push(`REROUTE_ORDER must originate from ${affectedMachineId}`);
            }

            if (!action.targetMachineId) {
                violations.push("REROUTE_ORDER requires targetMachineId");
            }

            break;
        }
    }
}

function simulatePlan(plan: RecoveryPlan, context: RecoverySimulationContext): RecoverySimulationOutcome {
    /*
     * First validate that all identifiers proposed by the plan
     * belong to the current incident.
     */
    const violations = validatePlanTargets(plan, context);
    const production = context.analysis.production;
    const remainingUnits = production.remainingUnits ?? 0;
    const rerouteAction = findRerouteAction(plan);

    let productionMachineId: string | null = context.incident.machineId;
    let productionCapacityPerHour = production.currentMachineCapacity;

    /*
     * Validate rerouting using deterministic
     * Production Agent facts.
     */
    if (rerouteAction) {
        if (!rerouteAction.targetMachineId) {
            violations.push("REROUTE_ORDER requires a target machine");
            productionMachineId = null;
            productionCapacityPerHour = 0;
        } else {
            const alternative = production.alternatives.find((candidate) => candidate.machineId === rerouteAction.targetMachineId);

            if (!alternative) {
                violations.push(`Machine ${rerouteAction.targetMachineId} is not a verified compatible alternative`);
                productionMachineId = null;
                productionCapacityPerHour = 0;
            } else if (!alternative.available) {
                violations.push(`Machine ${alternative.machineId} is not available`);
                productionMachineId = null;
                productionCapacityPerHour = 0;
            } else if (alternative.capacity <= 0) {
                violations.push(`Machine ${alternative.machineId} has no usable production capacity`);
                productionMachineId = null;
                productionCapacityPerHour = 0;
            } else {
                productionMachineId = alternative.machineId;
                productionCapacityPerHour = alternative.capacity;
            }
        }
    }

    const pausesAffectedMachine = hasAction(plan, "PAUSE_MACHINE");
    const continuesProduction = hasAction(plan, "CONTINUE_PRODUCTION");

    /*
     * If the affected machine is paused and production
     * has not been rerouted, there is no active
     * production capacity.
     */
    if (pausesAffectedMachine && !rerouteAction) {
        productionMachineId = null;
        productionCapacityPerHour = 0;
    }

    /*
     * Reject contradictory recovery instructions.
     */
    if (pausesAffectedMachine && continuesProduction && !rerouteAction) {
        violations.push("Plan cannot pause and continue production on the affected machine simultaneously");
    }

    const estimatedProductionHours = productionMachineId ? calculateProductionHours(remainingUnits, productionCapacityPerHour) : null;
    const machineInspectionRequired = hasAction(plan, "INSPECT_MACHINE");
    const qualityHoldRequired = hasAction(plan, "HOLD_OUTPUT");
    const estimatedInterventionMinutes = machineInspectionRequired ? context.analysis.maintenance.estimatedInterventionMinutes : 0;

    /*
     * Total recovery duration is only calculable
     * when every required duration is known.
     *
     * Rerouted production can continue independently
     * of an unknown inspection duration, so its
     * production completion estimate remains valid.
     */
    let estimatedTotalRecoveryMinutes:
        | number
        | null = null;

    if (estimatedProductionHours !== null && !machineInspectionRequired) {
        estimatedTotalRecoveryMinutes = estimatedProductionHours * 60;
    } else if (estimatedProductionHours !== null && machineInspectionRequired && rerouteAction) {
        /*
         * Production continues on the alternative,
         * but full machine recovery time remains
         * unknown if intervention duration is unknown.
         */
        if (estimatedInterventionMinutes !== null) {
            estimatedTotalRecoveryMinutes = Math.max(estimatedProductionHours * 60, estimatedInterventionMinutes);
        }
    } else if (estimatedProductionHours !== null && estimatedInterventionMinutes !== null) {
        estimatedTotalRecoveryMinutes = estimatedProductionHours * 60 + estimatedInterventionMinutes;
    }

    return {
        planId: plan.id,
        feasible: violations.length === 0,
        constraintViolations: violations,
        productionMachineId,
        productionCapacityPerHour,
        remainingUnits,
        estimatedProductionHours,
        estimatedInterventionMinutes,
        estimatedTotalRecoveryMinutes,
        qualityHoldRequired,
        machineInspectionRequired,
        calculatedAt: new Date().toISOString(),
    };
}

export class RecoverySimulator {
    simulate(plans: RecoveryPlan[], context: RecoverySimulationContext): RecoverySimulationResult {
        return {
            incidentId: context.incident.id,
            incidentSeverity: context.incident.severity,
            outcomes: plans.map((plan) => simulatePlan(plan, context)),
            simulatedAt: new Date().toISOString(),
        };
    }
}