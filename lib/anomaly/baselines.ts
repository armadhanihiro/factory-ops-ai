export interface MachineBaseline {
    temperature: number;
    vibration?: number;
    motorCurrent: number;
    pressure?: number;
    outputRate: number;
    defectRate?: number;
}

export const machineBaselines: Record<string, MachineBaseline> = {
    "M-01": {
        temperature: 64,
        motorCurrent: 31,
        outputRate: 125,
    },

    "M-02": {
        temperature: 71,
        vibration: 3.1,
        motorCurrent: 42,
        pressure: 118,
        outputRate: 116,
        defectRate: 1.1,
    },

    "M-03": {
        temperature: 42,
        vibration: 1.2,
        motorCurrent: 8,
        pressure: 25,
        outputRate: 0,
        defectRate: 0,
    },

    "M-04": {
        temperature: 55,
        motorCurrent: 28,
        outputRate: 112,
    },
};