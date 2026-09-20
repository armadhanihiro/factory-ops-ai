import { createInitialFactoryState } from "./factory";
import { tickFactory } from "./telemetry";
import { createScenario } from "./scenarios";

import {
    FactoryState,
    ScenarioType,
} from "@/types/factory";

declare global {
    var factorySimulatorState: FactoryState | undefined;
}

function getStore(): FactoryState {
    if (!globalThis.factorySimulatorState) {
        globalThis.factorySimulatorState = createInitialFactoryState();
    }

    return globalThis.factorySimulatorState;
}

function setStore(state: FactoryState): FactoryState {
    globalThis.factorySimulatorState = state;

    return state;
}

export function getFactoryState(): FactoryState {
    return getStore();
}

export function advanceFactory(): FactoryState {
    return setStore(tickFactory(getStore()));
}

export function startScenario(type: ScenarioType): FactoryState {
    const currentState = getStore();

    return setStore({
        ...currentState,
        activeScenario: createScenario(type),
    });
}

export function resetFactory(): FactoryState {
    return setStore(createInitialFactoryState());
}