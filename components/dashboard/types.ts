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
    status: "OPEN" | "INVESTIGATING" | "MITIGATING" | "RESOLVED";
    severity: "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";
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
    simulation?: {
        active: boolean;
        tick: number;
    };
}

export interface DiagnosticResult {
    incidentId: string;
    machineId: string;
    severity: "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";
    primaryDiagnosis: {
        failureMode: string;
        confidence: number;
        reasoning: string;
    };
    recommendedChecks: string[];
    provider: "mock" | "gemini";
}

export interface QualityAssessment {
    incidentId: string;
    machineId: string;
    orderId: string | null;
    overallQualityRisk: "LOW" | "MEDIUM" | "HIGH";
    dispositionRecommendation:
        | "CONTINUE_MONITORING"
        | "HOLD_FOR_INSPECTION"
        | "QUARANTINE_RECOMMENDED";
    reasoning: string;
    provider: "mock" | "gemini";
}

export interface MaintenanceAssessment {
    incidentId: string;
    machineId: string;
    urgency:
        | "MONITOR"
        | "SCHEDULE_SOON"
        | "URGENT";
    suspectedFailureMode: string;
    estimatedInterventionMinutes: number | null;
    operationalRecommendation:
        | "CONTINUE_WITH_MONITORING"
        | "PLAN_MAINTENANCE"
        | "IMMEDIATE_INSPECTION_RECOMMENDED";
    reasoning: string;
    provider: "mock" | "gemini";
}

export interface ProductionAssessment {
    incidentId: string;
    machineId: string;
    affectedOrderId: string | null;
    impactLevel:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL";
    remainingUnits: number | null;
    productionAtRisk: boolean;
    recommendedStrategy:
        | "CONTINUE_CURRENT_PLAN"
        | "PREPARE_BACKUP_CAPACITY"
        | "REROUTE_RECOMMENDED"
        | "PAUSE_AND_REPLAN";
    reasoning: string;
    provider: "mock" | "gemini";
}

export interface OrchestrationResult {
    incidentId: string;
    status: "COMPLETED" | "FAILED";
    analysis: {
        incidentId: string;
        machineId: string;
        incidentSeverity:
            | "NORMAL"
            | "WARNING"
            | "HIGH"
            | "CRITICAL";
        diagnosis: DiagnosticResult;
        quality: QualityAssessment;
        maintenance: MaintenanceAssessment;
        production: ProductionAssessment;
        generatedAt: string;
    };
    completedAt: string;
}