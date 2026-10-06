import type {
    RecoveryAnalysisResult,
    RecoveryPlan,
    RecoveryPolicyValidation,
    RecoverySimulationOutcome,
} from "@/components/dashboard/types";

interface RecoveryPlanningProps {
    result: RecoveryAnalysisResult | null;
    analyzing: boolean;
    error: string | null;
    investigationComplete: boolean;
    onAnalyze: () => Promise<void>;
}

function formatLabel(value: string) {
    return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

function PlanCard({ plan, validation, simulation }: { plan: RecoveryPlan; validation?: RecoveryPolicyValidation; simulation?: RecoverySimulationOutcome; }) {
    const feasible = simulation?.feasible ?? false;
    const compliant = validation?.compliant ?? false;

    return (
        <div className="rounded-xl border border-white/5 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-100">
                        {plan.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                        {plan.id}
                    </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            feasible ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-red-400/20 bg-red-400/10 text-red-300"
                        }`}
                    >
                        {feasible ? "Feasible" : "Blocked"}
                    </span>

                    <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                            compliant ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" : "border-orange-400/20 bg-orange-400/10 text-orange-300"
                        }`}
                    >
                        {compliant ? "Policy OK" : "Policy Conflict"}
                    </span>
                </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
                {plan.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
                {plan.actions.map((action, index) => (
                    <span
                        key={`${plan.id}-${action.type}-${index}`}
                        className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-slate-400"
                    >
                        {formatLabel(action.type)}
                    </span>
                ))}
            </div>

            {simulation && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs">
                    <div>
                        <p className="text-slate-600">Production</p>
                        <p className="mt-1 font-medium text-slate-300">
                            {simulation.productionMachineId ?? "Paused"}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-600">Capacity</p>
                        <p className="mt-1 font-medium text-slate-300">
                            {simulation.productionCapacityPerHour}/h
                        </p>
                    </div>
                </div>
            )}

            {simulation && simulation.constraintViolations.length > 0 && (
                <div className="mt-4 rounded-lg border border-red-400/10 bg-red-400/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-red-300">
                        Simulation Constraint
                    </p>

                    {simulation.constraintViolations.map((violation) => (
                        <p key={violation} className="mt-1 text-xs leading-5 text-red-200/70">
                            {violation}
                        </p>
                    ))}
                </div>
            )}

            {validation && validation.violations.length > 0 && (
                <div className="mt-3 rounded-lg border border-orange-400/10 bg-orange-400/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-300">
                        Policy Conflict
                    </p>

                    {validation.violations.map((violation) => (
                        <p
                            key={violation}
                            className="mt-1 text-xs leading-5 text-orange-200/70"
                        >
                            {violation}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RecoveryPlanning({ result, analyzing, error, investigationComplete, onAnalyze }: RecoveryPlanningProps) {
    if (!result) {
        return (
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Recovery Planning
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Generate and independently validate recovery strategies.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        disabled={!investigationComplete || analyzing}
                        onClick={() => void onAnalyze()}
                        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {analyzing ? "Analyzing recovery strategies..." : "Generate Recovery Plans"}
                    </button>

                    {!investigationComplete && (
                        <p className="mt-3 text-center text-xs text-slate-600">
                            Complete the agent investigation first.
                        </p>
                    )}

                    {error && (
                        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                            {error}
                        </p>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Recovery Planning
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        AI-generated strategies · deterministic validation
                    </p>
                </div>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                    {result.plans.length} Plans
                </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {result.plans.map((plan) => {
                    const validation = result.policyValidations.find((item) => item.planId === plan.id);
                    const simulation = result.simulation.outcomes.find((item) => item.planId === plan.id);

                    return (
                        <PlanCard key={plan.id} plan={plan} validation={validation} simulation={simulation}/>
                    );
                })}
            </div>
        </section>
    );
}