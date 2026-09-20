import type { FactoryState, Incident } from "@/types/factory";
import type { DiagnosticResult } from "@/types/diagnostic";

import type { DiagnosticProvider } from "./types";
import { MockDiagnosticProvider } from "./mock-provider";

export class DiagnosticAgent {
    constructor(private readonly provider: DiagnosticProvider = new MockDiagnosticProvider()) {}

    async investigate(incident: Incident, factoryState: FactoryState): Promise<DiagnosticResult> {
        return this.provider.diagnose({
            incident,
            factoryState,
        });
    }
}