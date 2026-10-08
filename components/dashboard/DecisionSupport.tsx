"use client";

import type {
    DecisionSupportResult,
    RecoveryAnalysisResult,
} from "./types";

interface DecisionSupportProps {
    result: DecisionSupportResult | null;
    recoveryAnalysis: RecoveryAnalysisResult | null;
    loading: boolean;
    error: string | null;
    onGenerate: () => void;
}

export default function DecisionSupport({ result, recoveryAnalysis, loading, error, onGenerate }: DecisionSupportProps) {
    const canGenerate = recoveryAnalysis !== null;

    return (
        <section className="rounded-xl border border-white/10 bg-[#10151c] p-5">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        Decision Support
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Grounded trade-offs for supervisor review
                    </p>
                </div>

                {result && (
                    <span className="rounded-full border border-cyan-500/30 px-3 py-1 text-xs text-cyan-400">
                        {result.provider.toUpperCase()}
                    </span>
                )}
            </div>

            {!result && (
                <div className="rounded-lg border border-white/10 p-5">
                    <p className="mb-4 text-sm text-slate-400">
                        {canGenerate ? "Recovery plans are ready for decision support." : "Generate recovery plans before requesting decision support."}
                    </p>

                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={!canGenerate || loading}
                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? "Analyzing Trade-offs..." : "Generate Decision Support"}
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-3 text-sm text-red-400">
                    {error}
                </p>
            )}

            {result && (
                <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {result.planTradeoffs.map((tradeoff) => {
                            const plan = recoveryAnalysis?.plans.find((item) => item.id === tradeoff.planId);

                            return (
                                <article key={tradeoff.planId} className="rounded-lg border border-white/10 bg-[#0b1016] p-4">
                                    <h3 className="text-sm font-semibold text-white">
                                        {plan?.name ?? tradeoff.planId}
                                    </h3>

                                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                        {tradeoff.summary}
                                    </p>

                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold text-emerald-400">
                                            Advantages
                                        </h4>
                                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
                                            {tradeoff.advantages.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold text-amber-400">
                                            Considerations
                                        </h4>
                                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
                                            {tradeoff.considerations.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {tradeoff.unknowns.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-slate-400">
                                                Unknowns
                                            </h4>
                                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-400">
                                                {tradeoff.unknowns.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {tradeoff.policyConflictExplanation && (
                                        <p className="mt-4 rounded-md border border-red-500/20 p-3 text-xs text-red-400">
                                            {tradeoff.policyConflictExplanation}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                        <h3 className="text-xs font-semibold text-cyan-400">
                            Supervisor Note
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                            {result.supervisorNote}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}