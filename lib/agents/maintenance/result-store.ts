import type { MaintenanceAssessment } from "@/types/maintenance";

const globalForMaintenance = globalThis as typeof globalThis & {
    maintenanceResults?: Map<string, MaintenanceAssessment>;
};
const maintenanceResults = globalForMaintenance.maintenanceResults ?? new Map<string, MaintenanceAssessment>();

if (process.env.NODE_ENV !== "production") {
    globalForMaintenance.maintenanceResults = maintenanceResults;
}

export function getMaintenanceResult(incidentId: string): MaintenanceAssessment | undefined {
    return maintenanceResults.get(incidentId);
}

export function saveMaintenanceResult(result: MaintenanceAssessment): MaintenanceAssessment {
    maintenanceResults.set(result.incidentId, result);

    return result;
}

export function clearMaintenanceResults(): void {
    maintenanceResults.clear();
}