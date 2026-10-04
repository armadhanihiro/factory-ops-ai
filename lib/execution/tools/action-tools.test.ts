import {
    describe,
    expect,
    it,
} from "vitest";

import { resetFactory } from "@/lib/simulator/store";

import { executeHoldOutput } from "./hold-output";
import { executePauseMachine } from "./pause-machine";
import { executeRerouteOrder } from "./reroute-order";

describe("recovery action tools", () => {

    it("pauses the affected machine", () => {
        const state = resetFactory();
        const execution =
            executePauseMachine(
                state,
                {
                    type: "PAUSE_MACHINE",
                    machineId: "M-02",
                    reasoning:
                        "Pause affected machine",
                },
                0,
            );

        const machine = execution.state.machines.find((item) => item.id === "M-02");

        expect(machine?.status).toBe("IDLE");
        expect(execution.result.status).toBe("EXECUTED");
    });

    it("places affected output on hold", () => {
        const state = resetFactory();
        const execution = executeHoldOutput(
            state,
            {
                type: "HOLD_OUTPUT",
                orderId: "ORD-428",
                reasoning:
                    "Hold affected output",
            },
            0,
        );

        const order = execution.state.orders.find((item) => item.id === "ORD-428");

        expect(order?.status).toBe("AT_RISK");
        expect(execution.result.status).toBe("EXECUTED");
    });

    it("reroutes an order to an available machine", () => {
        const state = resetFactory();
        const execution = executeRerouteOrder(
            state,
            {
                type: "REROUTE_ORDER",
                orderId: "ORD-428",
                targetMachineId: "M-03",
                reasoning:
                    "Use available backup capacity",
            },
            0,
        );

        const source = execution.state.machines.find((item) => item.id === "M-02");
        const target = execution.state.machines.find((item) => item.id === "M-03");
        const order = execution.state.orders.find((item) => item.id === "ORD-428");

        expect(source?.currentOrderId).toBeUndefined();
        expect(target?.status).toBe("RUNNING");
        expect(target?.currentOrderId).toBe("ORD-428");
        expect(order?.assignedMachineId).toBe("M-03");
    });

    it("blocks rerouting to an unavailable machine", () => {
        const state = resetFactory();

        expect(() => executeRerouteOrder(
            state,
            {
                type: "REROUTE_ORDER",
                orderId: "ORD-428",
                targetMachineId: "M-01",
                reasoning:
                    "Invalid reroute test",
            },
            0,
        )).toThrow("Target machine M-01 is not available");
    });
});