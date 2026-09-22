import { describe, expect, it } from "vitest";
import { scoreFailureMode } from "./failure-mode-taxonomy";

describe("scoreFailureMode", () => {
    it("scores canonical failure mode as exact", () => {
        expect(scoreFailureMode("bearing_degradation", "bearing_degradation")).toBe(1);
    });

    it("scores an exact bearing synonym as exact", () => {
        expect(scoreFailureMode("Progressive bearing wear", "bearing_degradation")).toBe(1);
    });

    it("gives partial credit to a broader mechanical diagnosis", () => {
        expect(scoreFailureMode("Mechanical Component Wear/Misalignment (e.g., Bearings)", "bearing_degradation")).toBe(0.5);
    });

    it("rejects an unrelated failure mode", () => {
        expect(scoreFailureMode("Electrical control fault", "bearing_degradation")).toBe(0);
    });

    it("does not treat shaft misalignment as bearing degradation", () => {
        expect(scoreFailureMode("shaft_misalignment", "bearing_degradation")).toBe(0);
    });
});