import {
    ActiveScenario,
    FactoryState,
    Machine,
    ScenarioType,
} from "@/types/factory";

export function createScenario(type: ScenarioType): ActiveScenario {
    switch (type) {
        case "BEARING_DEGRADATION":
        return {
            type,
            status: "ACTIVE",
            targetMachineId: "M-02",
            startedAt: new Date().toISOString(),
            tick: 0,
            groundTruth: {
                failureMode: "bearing_degradation",
                rootCause: "Progressive wear of the main drive bearing",
            },
        };

        default: throw new Error(`Scenario ${type} is not implemented yet`);
    }
}

export function applyScenario(state: FactoryState): FactoryState {
    const scenario = state.activeScenario;

    if (!scenario || scenario.status !== "ACTIVE") {
        return state;
    }

    switch (scenario.type) {
        case "BEARING_DEGRADATION":
        return applyBearingDegradation(state, scenario);

        default: return state;
    }
}

function applyBearingDegradation(state: FactoryState, scenario: ActiveScenario): FactoryState {
    const nextTick = scenario.tick + 1;
    const machines = state.machines.map((machine) => {
        if (machine.id !== scenario.targetMachineId) {
            return machine;
        }

        return degradeBearing(machine, nextTick);
    });

    return {
        ...state,
        machines,
        activeScenario: {
            ...scenario,
            tick: nextTick,
        },
    };
}

function degradeBearing(machine: Machine, tick: number): Machine {
    const telemetry = { ...machine.telemetry };

    /*
    * Stage 1 — Early degradation
    * Slight vibration increase.
    */
    if (tick <= 3) {
        telemetry.vibration = Number(((telemetry.vibration ?? 0) + 0.35).toFixed(2));
    }

    /*
    * Stage 2 — Developing fault
    * Vibration and temperature begin rising together.
    */
    else if (tick <= 6) {
        telemetry.vibration = Number(((telemetry.vibration ?? 0) + 0.7).toFixed(2));
        telemetry.temperature = Number((telemetry.temperature + 1.8).toFixed(1));
    }

    /*
    * Stage 3 — Performance degradation
    * Production starts being affected.
    */
    else if (tick <= 9) {
        telemetry.vibration = Number(((telemetry.vibration ?? 0) + 1.0).toFixed(2));
        telemetry.temperature = Number((telemetry.temperature + 2.5).toFixed(1));
        telemetry.outputRate = Math.max(0, telemetry.outputRate - 6);

        if (telemetry.defectRate !== undefined) {
            telemetry.defectRate = Number((telemetry.defectRate + 0.6).toFixed(2));
        }
    }

    /*
    * Stage 4 — Severe degradation
    */
    else {
        telemetry.vibration = Number(((telemetry.vibration ?? 0) + 1.3).toFixed(2),);
        telemetry.temperature = Number(Math.min(telemetry.temperature + 3, 115).toFixed(1));
        telemetry.outputRate = Math.max(0, telemetry.outputRate - 10,);

        if (telemetry.defectRate !== undefined) {
            telemetry.defectRate = Number(
                Math.min(telemetry.defectRate + 1, 100).toFixed(2),
            );
        }
    }

    return {
        ...machine,
        telemetry,
    };
}