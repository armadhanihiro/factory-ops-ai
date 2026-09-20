import type {
  FactoryState,
  Incident,
} from "@/types/factory";

import type { DiagnosticResult } from "@/types/diagnostic";

import type { DiagnosticProvider } from "./types";
import { createDiagnosticProvider } from "./provider";

export class DiagnosticAgent {
    constructor(private readonly provider: DiagnosticProvider = createDiagnosticProvider()) {}

    async investigate(incident: Incident, factoryState: FactoryState): Promise<DiagnosticResult> {
        return this.provider.diagnose({
            incident,
            factoryState,
        });
    }
}