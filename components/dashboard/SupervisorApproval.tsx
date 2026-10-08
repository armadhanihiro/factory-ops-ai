"use client";

import { useState } from "react";

import type {
    DecisionSupportResult,
    RecoveryAnalysisResult,
    RecoveryApproval,
} from "./types";

interface SupervisorApprovalProps {
    recoveryAnalysis: RecoveryAnalysisResult | null;
    decisionSupport: DecisionSupportResult | null;
    approval: RecoveryApproval | null;
    busy: boolean;
    error: string | null;
    onRequestApproval: (planId: string) => Promise<void>;
    onDecide: (decision: "APPROVE" | "REJECT", note: string) => Promise<void>;
}

export default function SupervisorApproval({ recoveryAnalysis, decisionSupport, approval, busy, error, onRequestApproval, onDecide }: SupervisorApprovalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [supervisorNote, setSupervisorNote] = useState("");
    const plans = recoveryAnalysis?.plans ?? [];
    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
    const selectedSimulation = recoveryAnalysis?.simulation.outcomes.find((outcome) => outcome.planId === selectedPlanId);
    const selectedPolicy = recoveryAnalysis?.policyValidations.find((validation) => validation.planId === selectedPlanId);
    const selectedEligible = selectedSimulation?.feasible === true && selectedPolicy?.compliant === true;

    return (
        <section className="rounded-xl border border-white/10 bg-[#10151c] p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold text-white">
                    Supervisor Approval
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    Human authorization required before recovery execution
                </p>
            </div>

            {!decisionSupport && (
                <p className="text-sm text-slate-400">
                    Complete Decision Support before requesting approval.
                </p>
            )}

            {decisionSupport && (
                <div className="space-y-5">
                    <div className="grid gap-3 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const simulation = recoveryAnalysis?.simulation.outcomes.find((outcome) => outcome.planId === plan.id);
                            const policy = recoveryAnalysis?.policyValidations.find((validation) => validation.planId === plan.id);
                            const eligible = simulation?.feasible === true && policy?.compliant === true;
                            const selected = selectedPlanId === plan.id;

                            return (
                                <button
                                    key={plan.id}
                                    type="button"
                                    disabled={!eligible || busy || approval !== null}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        selected ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-[#0b1016] hover:border-white/30"
                                    }`}
                                >
                                    <p className="text-sm font-semibold text-white">
                                        {plan.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {plan.id}
                                    </p>

                                    <p
                                        className={`mt-3 text-xs font-medium ${
                                            eligible ? "text-emerald-400" : "text-red-400"
                                        }`}
                                    >
                                        {eligible ? "Eligible for approval" : "Blocked by validation"}
                                    </p>

                                    {!eligible && (
                                        <div className="mt-2 space-y-1 text-xs text-red-300">
                                            {simulation?.constraintViolations.map(
                                                (reason, index) => (
                                                    <p key={`simulation-${index}`}>
                                                        {reason}
                                                    </p>
                                                ),
                                            )}

                                            {policy?.violations.map((reason, index) => (
                                                <p key={`policy-${index}`}>
                                                    {reason}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {!approval && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4">
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {selectedPlan ? selectedPlan.name : "No recovery plan selected"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Requesting approval does not execute the plan.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={!selectedEligible || busy}
                                onClick={() => {
                                    void onRequestApproval(selectedPlanId);
                                }}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {busy ? "Processing..." : "Request Approval"}
                            </button>
                        </div>
                    )}

                    {approval && (
                        <div className="rounded-lg border border-white/10 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {approval.planSnapshot.name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {approval.id}
                                    </p>
                                </div>

                                <span className="rounded-full border border-cyan-500/30 px-3 py-1 text-xs text-cyan-400">
                                    {approval.status}
                                </span>
                            </div>

                            {approval.status === "PENDING" && (
                                <div className="mt-5 space-y-3">
                                    <label htmlFor="supervisor-note" className="block text-xs text-slate-400">
                                        Supervisor note (optional)
                                    </label>

                                    <textarea
                                        id="supervisor-note"
                                        value={supervisorNote}
                                        onChange={(event) => setSupervisorNote(event.target.value)}
                                        rows={3}
                                        placeholder="Add operational instructions or reasons..."
                                        className="w-full rounded-lg border border-white/10 bg-[#080c12] p-3 text-sm text-white outline-none focus:border-cyan-500/50"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => {
                                                void onDecide("APPROVE", supervisorNote);
                                            }}
                                            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                                        >
                                            Approve Plan
                                        </button>

                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => {
                                                void onDecide("REJECT", supervisorNote);
                                            }}
                                            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 disabled:opacity-40"
                                        >
                                            Reject Plan
                                        </button>
                                    </div>
                                </div>
                            )}

                            {approval.status !== "PENDING" && (
                                <p className="mt-4 text-sm text-slate-300">
                                    Supervisor decision: {approval.status}
                                    {approval.supervisorNote ? ` — ${approval.supervisorNote}` : ""}
                                </p>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}
                </div>
            )}
        </section>
    );
}