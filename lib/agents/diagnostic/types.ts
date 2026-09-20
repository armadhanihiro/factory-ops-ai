import type { FactoryState, Incident } from "@/types/factory";
import type { DiagnosticResult } from "@/types/diagnostic";

export interface DiagnosticContext {
    incident: Incident;
    factoryState: FactoryState;
}

export interface DiagnosticProvider {
    diagnose(context: DiagnosticContext): Promise<DiagnosticResult>;
}