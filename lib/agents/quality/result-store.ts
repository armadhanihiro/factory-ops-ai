import type { QualityAssessment } from "@/types/quality";

const globalForQuality = globalThis as typeof globalThis & {
    qualityResults?: Map<string, QualityAssessment>;
};

const qualityResults = globalForQuality.qualityResults ?? new Map<string, QualityAssessment>();

if (process.env.NODE_ENV !== "production") {
    globalForQuality.qualityResults = qualityResults;
}

export function getQualityResult(incidentId: string): QualityAssessment | undefined {
    return qualityResults.get(incidentId);
}

export function saveQualityResult(result: QualityAssessment): QualityAssessment {
    qualityResults.set(result.incidentId, result);
    return result;
}

export function clearQualityResults(): void {
    qualityResults.clear();
}