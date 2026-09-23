import { GeminiMaintenanceProvider } from "./gemini-provider";
import { MockMaintenanceProvider } from "./mock-provider";
import type { MaintenanceProvider } from "./types";

export function createMaintenanceProvider(): MaintenanceProvider {
    const provider = process.env.MAINTENANCE_PROVIDER?.toLowerCase() ?? "mock";

    switch (provider) {
        case "gemini":
            return new GeminiMaintenanceProvider();

        case "mock":
            return new MockMaintenanceProvider();

        default:
            throw new Error(`Unsupported MAINTENANCE_PROVIDER: ${provider}`);
    }
}