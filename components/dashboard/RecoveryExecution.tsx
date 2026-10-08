
"use client";

import { useState } from "react";

import type {
    RecoveryApproval,
    RecoveryExecution as RecoveryExecutionRecord,
} from "./types";

interface RecoveryExecutionProps {
    approval: RecoveryApproval | null;
    execution: RecoveryExecutionRecord | null;
    busy: boolean;
    error: string | null;
    blockingReasons: string[];
    onExecute: () => Promise<void>;
}

export default function RecoveryExecution({ approval, execution, busy, error, blockingReasons, onExecute }: RecoveryExecutionProps) {
    const [confirmed, setConfirmed] = useState(false);
    const canExecute = approval?.status === "APPROVED" && !execution && !busy;

    return (
        <section className="rounded-xl border border-white/10 bg-[#10151c] p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold text-white">
                    Recovery Execution
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                    Execute only the supervisor-approved recovery plan
                </p>
            </div>

            {!approval && (
                <p className="text-sm text-slate-400">
                    Supervisor approval is required before execution.
                </p>
            )}

            {approval && (
                <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-[#0b1016] p-4">
                        <p className="text-sm font-semibold text-white">
                            {approval.planSnapshot.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            {approval.id}
                        </p>
                        <p className="mt-3 text-xs text-cyan-400">
                            Authorization: {approval.status}
                        </p>
                    </div>

                    {approval.status === "APPROVED" && !execution && (
                        <div className="space-y-3 rounded-lg border border-white/10 p-4">
                            <p className="text-xs text-slate-400">
                                Execution will apply the approved plan to the factory simulator.
                                This action cannot be repeated.
                            </p>

                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={(event) => setConfirmed(event.target.checked)}
                                    disabled={busy}
                                    className="accent-cyan-500"
                                />
                                I confirm execution of this approved recovery plan.
                            </label>

                            <button
                                type="button"
                                disabled={!canExecute || !confirmed}
                                onClick={() => {
                                    void onExecute();
                                }}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {busy ? "Executing..." : "Execute Approved Plan"}
                            </button>
                        </div>
                    )}

                    {approval.status !== "APPROVED" && (
                        <p className="text-sm text-amber-400">
                            Execution locked. Supervisor approval is required.
                        </p>
                    )}

                    {execution && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Execution Result
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {execution.id}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        execution.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                    }`}
                                >
                                    {execution.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {execution.actionResults.map((result) => (
                                    <div key={result.actionIndex} className="rounded-lg border border-white/10 bg-[#0b1016] p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-medium text-white">
                                                {result.actionIndex + 1}.{" "}
                                                {result.action.type.replaceAll("_", " ")}
                                            </p>

                                            <span className={`text-xs ${result.status === "EXECUTED" ? "text-emerald-400" : "text-red-400"}`}>
                                                {result.status}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-slate-400">
                                            {result.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {blockingReasons.length > 0 && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                            <p className="text-sm font-medium text-amber-400">
                                Execution blocked
                            </p>

                            {blockingReasons.map((reason, index) => (
                                <p key={index} className="mt-2 text-xs text-amber-200">
                                    {reason}
                                </p>
                            ))}
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
