import type {
    FactoryIncident,
    OrchestrationResult,
} from "@/components/dashboard/types";

interface AgentInvestigationProps {
    incident: FactoryIncident | null;
    result: OrchestrationResult | null;
    investigating: boolean;
    error: string | null;
    onInvestigate: () => Promise<void>;
}

function formatLabel(value: string) {
    return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function AgentCard({ title, provider, headline, detail }: { title: string; provider: "mock" | "gemini"; headline: string; detail: string; }) {
    return (
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {title}
                    </p>
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {provider}
                </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-100">
                {headline}
            </p>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {detail}
            </p>
        </div>
    );
}

export function AgentInvestigation({ incident, result, investigating, error, onInvestigate }: AgentInvestigationProps) {
    if (!incident) {
        return (
            <section className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Agent Investigation
                </p>

                <div className="flex min-h-56 items-center justify-center text-center">
                    <div>
                        <p className="font-medium text-slate-400">
                            Awaiting incident
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            Cross-functional analysis becomes available after detection.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!result) {
        return (
            <section className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Agent Investigation
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Cross-functional investigation for {incident.id}
                        </p>
                    </div>

                    <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-xs font-medium text-orange-300">
                        {incident.severity}
                    </span>
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        disabled={investigating}
                        onClick={() => void onInvestigate()}
                        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {investigating ? "Agents investigating..." : "Investigate Incident"}
                    </button>

                    <p className="mt-3 text-center text-xs leading-5 text-slate-600">
                        Diagnostic, quality, maintenance, and production agents
                        will coordinate through the incident orchestrator.
                    </p>

                    {error && (
                        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                            {error}
                        </p>
                    )}
                </div>
            </section>
        );
    }

    const { diagnosis, quality, maintenance, production } = result.analysis;

    return (
        <section className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Agent Investigation
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Cross-functional analysis · {result.incidentId}
                    </p>
                </div>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    {result.status}
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <AgentCard
                    title="Diagnostic"
                    provider={diagnosis.provider}
                    headline={`${formatLabel(diagnosis.primaryDiagnosis.failureMode)} · ${Math.round(diagnosis.primaryDiagnosis.confidence * 100)}%`}
                    detail={diagnosis.primaryDiagnosis.reasoning}
                />

                <AgentCard
                    title="Quality"
                    provider={quality.provider}
                    headline={`${quality.overallQualityRisk} Risk · ${formatLabel(quality.dispositionRecommendation)}`}
                    detail={quality.reasoning}
                />

                <AgentCard
                    title="Maintenance"
                    provider={maintenance.provider}
                    headline={`${formatLabel(maintenance.urgency)} · ${formatLabel(maintenance.operationalRecommendation)}`}
                    detail={maintenance.reasoning}
                />

                <AgentCard
                    title="Production"
                    provider={production.provider}
                    headline={`${production.impactLevel} Impact · ${formatLabel(production.recommendedStrategy)}`}
                    detail={production.reasoning}
                />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-600">
                <span>Machine {result.analysis.machineId}</span>

                <span>
                    Coordinated analysis complete
                </span>
            </div>
        </section>
    );
}