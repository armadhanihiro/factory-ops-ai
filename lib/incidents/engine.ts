import type {
    AnomalyDetection,
    FactoryState,
    Incident,
} from "@/types/factory";

const INCIDENT_THRESHOLD = 0.6;

function shouldCreateIncident(anomaly: AnomalyDetection): boolean {
    return anomaly.anomalyScore >= INCIDENT_THRESHOLD;
}

function hasActiveIncident(incidents: Incident[], machineId: string): boolean {
    return incidents.some(
        (incident) => incident.machineId === machineId && incident.status !== "RESOLVED",
    );
}

function createIncident(anomaly: AnomalyDetection, incidentNumber: number): Incident {
    const timestamp = anomaly.timestamp;

    return {
        id: `INC-${String(incidentNumber).padStart(3, "0")}`,
        machineId: anomaly.machineId,
        status: "OPEN",
        severity: anomaly.severity,
        detectedAt: timestamp,
        updatedAt: timestamp,
        trigger: {
            anomalyScore: anomaly.anomalyScore,
            signals: anomaly.signals.map((signal) => ({
                ...signal,
            })),
        },
    };
}

export function processIncidents(state: FactoryState): FactoryState {
    const incidents = [...state.incidents];

    for (const anomaly of state.anomalies) {
        if (!shouldCreateIncident(anomaly)) {
            continue;
        }

        if (hasActiveIncident(incidents, anomaly.machineId)) {
            continue;
        }

        incidents.push(createIncident(anomaly, incidents.length + 1));
    }

    return {
        ...state,
        incidents,
    };
}