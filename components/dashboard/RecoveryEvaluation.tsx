
"use client";

import { useState } from "react";

import type { RecoveryEvaluation } from "@/types/recovery-evaluation";

interface RecoveryEvaluationProps {
    executionId: string | null;
}

export default function RecoveryEvaluation({ executionId }: RecoveryEvaluationProps) {
    const [evaluation, setEvaluation] = useState<RecoveryEvaluation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function runEvaluation() {
        if (!executionId || loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/recovery/executions/${executionId}/evaluation`,
                { method: "POST" },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? "Failed to evaluate recovery");
            }

            setEvaluation(data as RecoveryEvaluation);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Evaluation failed");
        } finally {
            setLoading(false);
        }
    }

    if (!executionId) return null;

    const comparison = evaluation?.predictionComparison;
    const comparisons = comparison ? [
            {
                label: "Production machine",
                expected: comparison.expectedProductionMachineId ?? "None",
                actual: comparison.actualProductionMachineId ?? "None",
                matched: comparison.productionMachineMatched,
            },
            {
                label: "Quality hold",
                expected: comparison.expectedQualityHold ? "Required" : "Not required",
                actual: comparison.actualQualityHold ? "Applied" : "Not applied",
                matched: comparison.qualityHoldMatched,
            },
            {
                label: "Machine inspection",
                expected: comparison.expectedInspection ? "Required" : "Not required",
                actual: comparison.actualInspection ? "Applied" : "Not applied",
                matched: comparison.inspectionMatched,
            },
    ] : [];

    return (
        <section className="rounded-xl border border-slate-800 bg-[#0e131a] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        Recovery Evaluation
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Verify recovery actions against post-execution simulator state
                    </p>
                </div>

                {evaluation ? (
                    <span className={`rounded-full border px-3 py-1 text-xs ${
                        evaluation.outcome === "RECOVERY_ACTIONS_ACHIEVED"
                            ? "border-emerald-800 text-emerald-400"
                            : evaluation.outcome === "RECOVERY_ACTIONS_PARTIALLY_ACHIEVED"
                            ? "border-amber-800 text-amber-400"
                            : "border-red-800 text-red-400"
                    }`}>
                        {evaluation.outcome.replaceAll("_", " ")}
                    </span>
                    ) : (
                    <button
                        type="button"
                        onClick={runEvaluation}
                        disabled={loading}
                        className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
                    >
                        {loading ? "Evaluating..." : "Evaluate Recovery"}
                    </button>
                )}
            </div>

            {error && (
                <p className="mb-4 rounded-lg border border-red-900 bg-red-950/20 p-3 text-xs text-red-400">
                    {error}
                </p>
            )}

            {!evaluation ? (
                <div className="rounded-lg border border-slate-800 p-4 text-xs text-slate-400">
                    Execution {executionId} is ready for evaluation.
                    Evaluation will compare the approved plan predictions with
                    the resulting factory state.
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-800 p-4">
                            <p className="text-xs text-slate-400">Actions achieved</p>
                            <p className="mt-2 text-2xl font-semibold text-white">
                                {evaluation.achievedActions}
                                <span className="text-base text-slate-500">
                                    /{evaluation.expectedActions}
                                </span>
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 p-4">
                            <p className="text-xs text-slate-400">Prediction matches</p>
                            <p className="mt-2 text-2xl font-semibold text-white">
                                {comparison?.matchedPredictions}
                                <span className="text-base text-slate-500">
                                    /{comparison?.totalPredictions}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-xs font-semibold text-white">
                            Prediction vs Result
                        </h3>

                        <div className="grid gap-3 md:grid-cols-3">
                            {comparisons.map((item) => (
                                <div key={item.label} className="rounded-lg border border-slate-800 p-4">
                                    <p className="text-xs font-medium text-white">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 text-xs text-slate-400">
                                        Expected: {item.expected}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-300">
                                        Result: {item.actual}
                                    </p>
                                    <p className={`mt-3 text-xs ${ item.matched ? "text-emerald-400" : "text-red-400" }`}>
                                        {item.matched ? "MATCHED" : "MISMATCHED"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-xs font-semibold text-white">
                            Action Verification
                        </h3>

                        <div className="space-y-2">
                            {evaluation.actionEvaluations.map((action) => (
                                <div key={action.actionIndex} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-800 p-3">
                                    <div>
                                        <p className="text-xs font-medium text-white">
                                            {action.actionIndex + 1}.{" "}
                                            {action.actionType.replaceAll("_", " ")}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {action.observation}
                                        </p>
                                    </div>

                                    <span className={`text-xs ${ action.achieved ? "text-emerald-400" : "text-red-400" }`}>
                                        {action.achieved ? "ACHIEVED" : "NOT ACHIEVED"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="border-t border-slate-800 pt-3 text-xs text-slate-500">
                        This evaluation verifies immediate recovery action outcomes in the simulator. It does not establish long-term production recovery or automatically resolve the incident.
                    </p>
                </div>
            )}
        </section>
    );
}
