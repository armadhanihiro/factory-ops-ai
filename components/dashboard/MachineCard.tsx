import type { Machine } from "./types";

interface MachineCardProps {
    machine: Machine;
}

function getStatusClasses(status: Machine["status"]) {
    switch (status) {
        case "RUNNING":
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
        case "IDLE":
            return "border-slate-500/20 bg-slate-500/10 text-slate-300";
        case "WARNING":
            return "border-amber-500/20 bg-amber-500/10 text-amber-300";
        case "FAULT":
            return "border-red-500/20 bg-red-500/10 text-red-300";
        case "MAINTENANCE":
            return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }
}

function formatMetric(value: number | undefined, suffix: string) {
    if (value === undefined) {
        return "—";
    }

    return `${value}${suffix}`;
}

export function MachineCard({ machine }: MachineCardProps) {
    return (
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        {machine.id}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-white">
                        {machine.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {machine.type}
                    </p>
                </div>

                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${getStatusClasses(machine.status)}`}>
                    {machine.status}
                </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric label="Output" value={formatMetric(machine.telemetry.outputRate, "/h")}/>
                <Metric label="Temperature" value={formatMetric(machine.telemetry.temperature, "°C")}/>
                <Metric label="Vibration" value={formatMetric(machine.telemetry.vibration, "")}/>
                <Metric label="Load" value={machine.currentOrderId ?? "No active order"}
                />
            </div>
        </article>
    );
}

function Metric({ label, value }: { label: string; value: string; }) {
    return (
        <div className="rounded-xl bg-black/20 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-600">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-200">
                {value}
            </p>
        </div>
    );
}