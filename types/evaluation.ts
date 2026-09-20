import type { DiagnosticResult } from "@/types/diagnostic";

export interface DiagnosticGroundTruth {
    machineId: string;
    failureMode: string;
    rootCause?: string;
}

export interface DiagnosticEvaluation {
  incidentId: string;
  machineId: string;
  diagnosisCorrect: boolean;
  diagnosisScore: number;
  evidenceGroundingScore: number;
  outputValidityScore: number;
  overallScore: number;
  expectedFailureMode: string;
  predictedFailureMode: string;
  provider: DiagnosticResult["provider"];
  evaluatedAt: string;
}