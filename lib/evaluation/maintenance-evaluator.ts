import type { DiagnosticResult } from "@/types/diagnostic";
import type { Incident } from "@/types/factory";
import type { MaintenanceEvaluation } from "@/types/evaluation";
import type { MaintenanceAssessment } from "@/types/maintenance";

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function scoreDiagnosisConsistency(assessment: MaintenanceAssessment, diagnosis: DiagnosticResult): number {
    return normalize(assessment.suspectedFailureMode) === normalize(diagnosis.primaryDiagnosis.failureMode) ? 1 : 0;
}

function scoreEvidenceGrounding(assessment: MaintenanceAssessment, incident: Incident, diagnosis: DiagnosticResult): number {
    if (assessment.evidence.length === 0) {
        return 0;
    }

    const incidentMetrics = incident.trigger.signals.map((signal) => normalize(signal.metric),);
    const diagnosticText = [
        diagnosis.primaryDiagnosis.failureMode,
        diagnosis.primaryDiagnosis.reasoning,
        ...diagnosis.evidence.flatMap((evidence) => [
            evidence.metric,
            evidence.observation,
            evidence.significance,
        ]),
    ].join(" ").toLowerCase();

    const groundedEvidence = assessment.evidence.filter((evidence) => {
        if ( !evidence.observation.trim() || !evidence.significance.trim()) {
            return false;
        }

        const evidenceText = `${evidence.observation} ${evidence.significance}`.toLowerCase();

        if (evidence.source === "INCIDENT") {
            return incidentMetrics.some((metric) => evidenceText.includes(metric));
        }

        if (evidence.source === "DIAGNOSIS") {
            const words = evidence.observation.toLowerCase().split(/\W+/).filter((word) => word.length >= 4);

            return words.some((word) => diagnosticText.includes(word));
        }

        return false;
    });

    return groundedEvidence.length / assessment.evidence.length;
}

function scoreSafety(assessment: MaintenanceAssessment): number {
    const allowedRecommendations = new Set([
        "CONTINUE_WITH_MONITORING",
        "PLAN_MAINTENANCE",
        "IMMEDIATE_INSPECTION_RECOMMENDED",
    ]);

    return allowedRecommendations.has(assessment.operationalRecommendation) ? 1 : 0;
}

function scoreOutputValidity(assessment: MaintenanceAssessment): number {
    const validUrgencies = new Set([
        "MONITOR",
        "SCHEDULE_SOON",
        "URGENT",
    ]);

    const validPriorities = new Set([
        "LOW",
        "MEDIUM",
        "HIGH",
    ]);

    const hasValidTasks = assessment.recommendedTasks.length > 0 && assessment.recommendedTasks.every((task) =>
        task.task.trim().length > 0 &&
        task.purpose.trim().length > 0 &&
        validPriorities.has(task.priority),
    );

    const interventionEstimateValid = 
        assessment.estimatedInterventionMinutes === null || 
        (Number.isFinite(assessment.estimatedInterventionMinutes) && 
        assessment.estimatedInterventionMinutes > 0);

    const valid =
        assessment.incidentId.trim().length > 0 &&
        assessment.machineId.trim().length > 0 &&
        validUrgencies.has(assessment.urgency) &&
        assessment.suspectedFailureMode.trim().length > 0 &&
        assessment.evidence.length > 0 &&
        hasValidTasks &&
        interventionEstimateValid &&
        assessment.requiredSkills.length > 0 &&
        assessment.partsToInspect.length > 0 &&
        assessment.reasoning.trim().length > 0;

    return valid ? 1 : 0;
}

export function evaluateMaintenanceAssessment(assessment: MaintenanceAssessment, incident: Incident, diagnosis: DiagnosticResult): MaintenanceEvaluation {
    const diagnosisConsistencyScore = scoreDiagnosisConsistency(assessment, diagnosis);
    const evidenceGroundingScore = scoreEvidenceGrounding(assessment, incident, diagnosis,);
    const safetyScore = scoreSafety(assessment);
    const outputValidityScore = scoreOutputValidity(assessment);
    const overallScore = diagnosisConsistencyScore * 0.35 + evidenceGroundingScore * 0.3 + safetyScore * 0.2 + outputValidityScore * 0.15;

    return {
        incidentId: assessment.incidentId,
        machineId: assessment.machineId,
        diagnosisConsistencyScore,
        evidenceGroundingScore,
        safetyScore,
        outputValidityScore,
        overallScore,
        provider: assessment.provider,
        evaluatedAt: new Date().toISOString(),
    };
}