import type { RecoveryPlan } from "@/types/recovery";

export function buildReferenceRecoveryPlans(incidentId: string, machineId: string, orderId: string, alternativeMachineId: string): RecoveryPlan[] {
    return [
        {
            id: "PLAN-A",
            name: "Continue With Monitoring",
            description: "Continue production on the affected machine while monitoring the incident.",
            incidentId,
            machineId,
            actions: [
                {
                    type: "CONTINUE_PRODUCTION",
                    machineId,
                    orderId,
                    reasoning: "Maintain current production while monitoring machine condition.",
                },
            ],
            rationale: "Prioritizes production continuity with minimal immediate disruption.",
        },

        {
            id: "PLAN-B",
            name: "Pause and Inspect",
            description: "Pause the affected machine and perform inspection before resuming production.",
            incidentId,
            machineId,
            actions: [
                {
                    type: "PAUSE_MACHINE",
                    machineId,
                    reasoning: "Pause production before mechanical inspection.",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId,
                    reasoning: "Investigate the suspected mechanical issue.",
                },
                {
                    type: "HOLD_OUTPUT",
                    machineId,
                    orderId,
                    reasoning: "Hold affected output for quality inspection.",
                },
            ],
            rationale: "Prioritizes machine and product risk reduction before production continues.",
        },

        {
            id: "PLAN-C",
            name: "Reroute and Inspect",
            description: "Reroute the affected order to a compatible machine while inspecting the incident machine.",
            incidentId,
            machineId,
            actions: [
                {
                    type: "PAUSE_MACHINE",
                    machineId,
                    reasoning: "Pause the affected machine for inspection.",
                },
                {
                    type: "INSPECT_MACHINE",
                    machineId,
                    reasoning: "Investigate the suspected mechanical issue.",
                },
                {
                    type: "HOLD_OUTPUT",
                    machineId,
                    orderId,
                    reasoning: "Hold affected output for quality inspection.",
                },
                {
                    type: "REROUTE_ORDER",
                    machineId,
                    orderId,
                    targetMachineId: alternativeMachineId,
                    reasoning: "Use compatible backup capacity while the affected machine is inspected.",
                },
            ],
            rationale: "Balances production continuity with maintenance and quality risk mitigation.",
        },
    ];
}