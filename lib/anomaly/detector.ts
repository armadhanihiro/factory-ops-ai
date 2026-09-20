import {
    AnomalyDetection,
    AnomalySeverity,
    AnomalySignal,
    Machine,
} from "@/types/factory";

import {
    MachineBaseline,
    machineBaselines,
} from "./baselines";

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function percentageChange(value: number, baseline: number): number {
    if (baseline === 0) {
        return 0;
    }

    return ((value - baseline) / baseline) * 100;
}

function createHighSignal(metric: string, value: number, baseline: number, warningDeviation: number, criticalDeviation: number): AnomalySignal | null {
    const deviation = percentageChange(value, baseline);

    if (deviation < warningDeviation) {
        return null;
    }

    const score = clamp((deviation - warningDeviation) / (criticalDeviation - warningDeviation), 0, 1);

    return {
        metric,
        value,
        baseline,
        deviationPercent: Number(deviation.toFixed(1)),
        score: Number(score.toFixed(2)),
        message: `${metric} is ${deviation.toFixed(1)}% above healthy baseline`,
    };
}

function createLowSignal(metric: string, value: number, baseline: number, warningDrop: number, criticalDrop: number): AnomalySignal | null {
    if (baseline === 0) {
        return null;
    }

    const drop = ((baseline - value) / baseline) * 100;

    if (drop < warningDrop) {
        return null;
    }

    const score = clamp((drop - warningDrop) / (criticalDrop - warningDrop), 0, 1);

    return {
        metric,
        value,
        baseline,
        deviationPercent: Number((-drop).toFixed(1)),
        score: Number(score.toFixed(2)),
        message: `${metric} is ${drop.toFixed(1)}% below healthy baseline`,
    };
}

function getSeverity(score: number): AnomalySeverity {
    if (score >= 0.85) {
        return "CRITICAL";
    }

    if (score >= 0.6) {
        return "HIGH";
    }

    if (score >= 0.25) {
        return "WARNING";
    }

    return "NORMAL";
}

function calculateAnomalyScore(signals: AnomalySignal[]): number {
    if (signals.length === 0) {
        return 0;
    }

    /*
    * Multiple abnormal signals should strengthen
    * confidence, while one weak signal should not
    * immediately create a severe anomaly.
    */

    const sortedScores = signals.map((signal) => signal.score).sort((a, b) => b - a);
    const strongest = sortedScores[0] ?? 0;
    const secondStrongest = sortedScores[1] ?? 0;
    const combined = strongest * 0.75 + secondStrongest * 0.25;

    return Number(clamp(combined, 0, 1).toFixed(2));
}

function detectMachineAnomaly(machine: Machine, baseline: MachineBaseline): AnomalyDetection {
    const telemetry = machine.telemetry;
    const signals: AnomalySignal[] = [];
    const temperatureSignal = createHighSignal("temperature", telemetry.temperature, baseline.temperature, 8, 35);

    if (temperatureSignal) {
        signals.push(temperatureSignal);
    }

    if (telemetry.vibration !== undefined && baseline.vibration !== undefined) {
        const vibrationSignal = createHighSignal("vibration", telemetry.vibration, baseline.vibration, 20, 150);

        if (vibrationSignal) {
            signals.push(vibrationSignal);
        }
    }

    const motorCurrentSignal = createHighSignal("motorCurrent", telemetry.motorCurrent, baseline.motorCurrent, 15, 60);

    if (motorCurrentSignal) {
        signals.push(motorCurrentSignal);
    }

    const outputSignal = createLowSignal("outputRate", telemetry.outputRate, baseline.outputRate, 10, 50);

    if (outputSignal) {
        signals.push(outputSignal);
    }

    if (telemetry.defectRate !== undefined && baseline.defectRate !== undefined && baseline.defectRate > 0) {
        const defectSignal = createHighSignal("defectRate", telemetry.defectRate, baseline.defectRate, 30, 300);

        if (defectSignal) {
            signals.push(defectSignal);
        }
    }

    const anomalyScore = calculateAnomalyScore(signals);

    return {
        machineId: machine.id,
        timestamp: telemetry.timestamp,
        anomalyScore,
        severity: getSeverity(anomalyScore),
        signals,
    };
}

export function detectFactoryAnomalies(machines: Machine[]): AnomalyDetection[] {
    return machines.filter((machine) => machine.status === "RUNNING" || machine.status === "WARNING").map((machine) => {
        const baseline = machineBaselines[machine.id];

        if (!baseline) {
            throw new Error(`Missing baseline for ${machine.id}`);
        }

        return detectMachineAnomaly(machine, baseline);
    });
}