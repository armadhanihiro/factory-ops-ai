
import { describe, expect, it } from "vitest";

import { createInitialFactoryState } from "./factory";
import { reconcileRecoveryTelemetry } from "./telemetry";

describe("reconcileRecoveryTelemetry", () => {
    it("reconciles output and KPIs after an order reroute", () => {
        const state = createInitialFactoryState();
        const originalState = structuredClone(state);
        const source = state.machines.find((m) => m.id === "M-02");
        const target = state.machines.find((m) => m.id === "M-03");
        const order = state.orders.find((o) => o.id === "ORD-428");

        if (!source || !target || !order) {
            throw new Error("Required test fixtures are missing");
        }

        source.status = "MAINTENANCE";
        source.currentOrderId = undefined;

        target.status = "RUNNING";
        target.currentOrderId = "ORD-428";

        order.assignedMachineId = "M-03";

        const beforeReconciliation = structuredClone(state);
        const result = reconcileRecoveryTelemetry(state);
        const reconciledSource = result.machines.find((m) => m.id === "M-02");
        const reconciledTarget = result.machines.find((m) => m.id === "M-03");

        expect(reconciledSource?.status).toBe("MAINTENANCE");
        expect(reconciledSource?.telemetry.outputRate).toBe(0);
        expect(reconciledTarget?.status).toBe("RUNNING");
        expect(reconciledTarget?.currentOrderId).toBe("ORD-428");
        expect(reconciledTarget?.telemetry.outputRate).toBe(100);
        expect(result.orders.find((o) => o.id === "ORD-428") ?.assignedMachineId).toBe("M-03");
        expect(result.totalOutput).toBe(337);
        expect(result.averageUtilization).toBe(88);
        expect(state).toEqual(beforeReconciliation);
        expect(originalState.machines.find((m) => m.id === "M-02") ?.telemetry.outputRate).toBe(116);
    });

    it("sets output to zero for idle and maintenance machines", () => {
        const state = createInitialFactoryState();
        state.machines[0].status = "IDLE";
        state.machines[1].status = "MAINTENANCE";
        const result = reconcileRecoveryTelemetry(state);

        expect(result.machines[0].telemetry.outputRate).toBe(0);
        expect(result.machines[1].telemetry.outputRate).toBe(0);
    });

    it("caps estimated output at machine capacity", () => {
        const state = createInitialFactoryState();
        const target = state.machines.find((m) => m.id === "M-03");

        if (!target) {
            throw new Error("Machine M-03 not found");
        }

        target.status = "RUNNING";
        target.currentOrderId = "ORD-428";
        target.telemetry.outputRate = 150;
        const result = reconcileRecoveryTelemetry(state);

        expect(result.machines.find((m) => m.id === "M-03") ?.telemetry.outputRate).toBe(100);
    });
});
