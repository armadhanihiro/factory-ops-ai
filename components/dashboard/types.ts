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

export type RecoveryActionType =
    | "CONTINUE_PRODUCTION"
    | "PAUSE_MACHINE"
    | "INSPECT_MACHINE"
    | "REROUTE_ORDER"
    | "HOLD_OUTPUT";

export interface RecoveryAction {
    type: RecoveryActionType;
    machineId?: string;
    orderId?: string;
    targetMachineId?: string;
    reasoning: string;
}

export interface RecoveryPlan {
    id: string;
    name: string;
    description: string;
    incidentId: string;
    machineId: string;
    actions: RecoveryAction[];
    rationale: string;
}

export interface RecoverySimulationOutcome {
    planId: string;
    feasible: boolean;
    constraintViolations: string[];
    productionMachineId: string | null;
    productionCapacityPerHour: number;
    remainingUnits: number;
    estimatedProductionHours: number | null;
    estimatedInterventionMinutes: number | null;
    estimatedTotalRecoveryMinutes: number | null;
    qualityHoldRequired: boolean;
    machineInspectionRequired: boolean;
    calculatedAt: string;
}

export interface RecoveryPolicyValidation {
    planId: string;
    compliant: boolean;
    violations: string[];
}

export interface RecoveryAnalysisResult {
    incidentId: string;
    incidentSeverity:
        | "NORMAL"
        | "WARNING"
        | "HIGH"
        | "CRITICAL";
    plans: RecoveryPlan[];
    policyValidations: RecoveryPolicyValidation[];
    simulation: {
        incidentId: string;
        incidentSeverity:
            | "NORMAL"
            | "WARNING"
            | "HIGH"
            | "CRITICAL";
        outcomes: RecoverySimulationOutcome[];
        simulatedAt: string;
    };
    analyzedAt: string;
}

export interface PlanTradeoff {
    planId: string;
    summary: string;
    advantages: string[];
    considerations: string[];
    policyConflictExplanation: string | null;
    unknowns: string[];
}

export interface DecisionSupportResult {
    incidentId: string;
    planTradeoffs: PlanTradeoff[];
    supervisorNote: string;
    generatedAt: string;
    provider: "mock" | "gemini";
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RecoveryApproval {
    id: string;
    incidentId: string;
    planId: string;
    planSnapshot: RecoveryPlan;
    status: ApprovalStatus;
    requestedAt: string;
    decidedAt: string | null;
    supervisorNote: string | null;
    recoveryAnalyzedAt: string;
    decisionSupportGeneratedAt: string;
}

export interface ApprovalRequestResult {
    approval: RecoveryApproval | null;
    eligibleForApproval: boolean;
    blockingReasons: string[];
}

export type ActionExecutionStatus = "EXECUTED" | "FAILED";

export interface ActionExecutionResult {
    actionIndex: number;
    action: RecoveryAction;
    status: ActionExecutionStatus;
    message: string;
    executedAt: string;
}

export type RecoveryExecutionStatus =
    | "COMPLETED"
    | "PARTIALLY_COMPLETED"
    | "FAILED";

export interface RecoveryExecution {
    id: string;
    approvalId: string;
    incidentId: string;
    planId: string;
    status: RecoveryExecutionStatus;
    actionResults: ActionExecutionResult[];
    predictionSnapshot: RecoverySimulationOutcome;
    startedAt: string;
    completedAt: string;
}

export interface RecoveryExecutionResult {
    execution: RecoveryExecution | null;
    executed: boolean;
    blockingReasons: string[];
}