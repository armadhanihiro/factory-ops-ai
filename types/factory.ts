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

export type OrderStatus =
    | "QUEUED"
    | "IN_PROGRESS"
    | "AT_RISK"
    | "COMPLETED";

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
}