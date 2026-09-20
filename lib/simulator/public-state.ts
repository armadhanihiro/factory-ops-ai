import { FactoryState } from "@/types/factory";

export type PublicFactoryState = Omit<FactoryState, "activeScenario"> & {
    simulation?: {
        active: boolean;
        tick: number;
    };
};

export function toPublicFactoryState(state: FactoryState): PublicFactoryState {
    const {
        activeScenario,
        ...publicState
    } = state;

    return {
        ...publicState,
        simulation: activeScenario ? {
            active: activeScenario.status === "ACTIVE",
            tick: activeScenario.tick,
        } : undefined,
    };
}