export interface MachineTelemetry {
    machineId: string;
    timestamp: string;
    temperature?: number;
    vibration?: number;
    motorCurrent?: number;
    pressure?: number;
    outputRate?: number;
    defectRate?: number;
}

export type MachineStatus =
    | "RUNNING"
    | "IDLE"
    | "WARNING"
    | "FAULT"
    | "MAINTENANCE";

export interface Machine {
    id: string;
    name: string;
    type: string;
    status: MachineStatus;
    capacity: number;
    currentOrderId?: string;
    telemetry: MachineTelemetry;
}

export interface FactoryOrder {
    id: string;
    product: string;
    targetUnits: number;
    completedUnits: number;
    assignedMachineId: string;
    deadline: string;
    status: string;
}

export interface AnomalySignal {
    metric: string;
    value: number;
    baseline: number;
    deviationPercent: number;
    score: number;
    message: string;
}

export interface FactoryIncident {
    id: string;
    machineId: string;
    status: string;
    severity: string;
    detectedAt: string;
    updatedAt: string;
    trigger: {
        anomalyScore: number;
        signals: AnomalySignal[];
    };
}

export interface PublicFactoryState {
    timestamp: string;
    machines: Machine[];
    orders: FactoryOrder[];
    totalOutput: number;
    averageUtilization: number;
    incidents: FactoryIncident[];
    activeScenario?: {
        type: string;
        status: string;
        targetMachineId: string;
        tick: number;
    } | null;
}