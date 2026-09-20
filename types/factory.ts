export type MachineStatus =
    | "RUNNING"
    | "IDLE"
    | "WARNING"
    | "FAULT"
    | "MAINTENANCE";

export type MachineType =
    | "MIXER"
    | "EXTRUDER"
    | "PACKAGING";

export type ScenarioType =
    | "BEARING_DEGRADATION"
    | "QUALITY_DRIFT"
    | "MATERIAL_SHORTAGE";

export type ScenarioStatus =
    | "INACTIVE"
    | "ACTIVE"
    | "COMPLETED";

export type OrderStatus =
    | "QUEUED"
    | "IN_PROGRESS"
    | "AT_RISK"
    | "COMPLETED";

export type AnomalySeverity =
    | "NORMAL"
    | "WARNING"
    | "HIGH"
    | "CRITICAL";

export type IncidentStatus =
    | "OPEN"
    | "INVESTIGATING"
    | "MITIGATING"
    | "RESOLVED";

export interface IncidentTrigger {
    anomalyScore: number;
    signals: AnomalySignal[];
}

export interface Incident {
    id: string;
    machineId: string;
    status: IncidentStatus;
    severity: AnomalySeverity;
    detectedAt: string;
    updatedAt: string;
    trigger: IncidentTrigger;
}

export interface AnomalySignal {
    metric: string;
    value: number;
    baseline: number;
    deviationPercent: number;
    score: number;
    message: string;
}

export interface AnomalyDetection {
    machineId: string;
    timestamp: string;
    anomalyScore: number;
    severity: AnomalySeverity;
    signals: AnomalySignal[];
}

export interface ActiveScenario {
    type: ScenarioType;
    status: ScenarioStatus;
    targetMachineId: string;
    startedAt: string;
    tick: number;

    // Simulator-only ground truth.
    // This must never be exposed to anomaly detection or AI agents.
    groundTruth: {
        failureMode: string;
        rootCause: string;
    };
}

export interface MachineTelemetry {
    machineId: string;
    timestamp: string;
    temperature: number;
    vibration?: number;
    motorCurrent: number;
    pressure?: number;
    outputRate: number;
    defectRate?: number;
}

export interface Machine {
    id: string;
    name: string;
    type: MachineType;
    status: MachineStatus;
    capacity: number;
    currentOrderId?: string;
    telemetry: MachineTelemetry;
}

export interface ProductionOrder {
    id: string;
    product: string;
    targetUnits: number;
    completedUnits: number;
    assignedMachineId: string;
    deadline: string;
    status: OrderStatus;
}

export interface FactoryState {
    timestamp: string;
    machines: Machine[];
    orders: ProductionOrder[];
    totalOutput: number;
    averageUtilization: number;
    anomalies: AnomalyDetection[];
    incidents: Incident[];
    activeScenario?: ActiveScenario;
}