import type {
    AnomalySignal,
    FactoryIncident,
} from "@/components/dashboard/types";

interface ActiveIncidentProps {
    incidents: FactoryIncident[];
}

function severityClasses(severity: FactoryIncident["severity"]) {
    switch (severity) {
        case "CRITICAL":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "HIGH":
            return "border-orange-500/30 bg-orange-500/10 text-orange-300";
        case "WARNING":
            return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
        default:
            return "border-white/10 bg-white/5 text-white/60";
    }
}

function SignalRow({ signal }: { signal: AnomalySignal }) {
    const sign = signal.deviationPercent >= 0 ? "+" : "";

    return (
        <div className="flex items-start justify-between gap-4 border-t border-white/5 py-3 first:border-t-0">
            <div>
                <p className="text-sm font-medium capitalize text-white/80">
                    {signal.metric}
                </p>

                <p className="mt-1 text-xs text-white/40">
                    Baseline {signal.baseline}
                </p>
            </div>

            <div className="text-right">
                <p className="text-sm font-semibold text-white">
                    {signal.value}
                </p>

                <p className="mt-1 text-xs text-white/50">
                    {sign}
                    {signal.deviationPercent.toFixed(1)}%
                </p>
            </div>
        </div>
    );
}

export function ActiveIncident({ incidents }: ActiveIncidentProps) {
    const incident = incidents.find((item) => item.status !== "RESOLVED");

    if (!incident) {
        return (
            <section className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                    Active Incident
                </p>

                <div className="flex min-h-56 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-3 h-2.5 w-2.5 rounded-full bg-emerald-400" />

                        <p className="font-medium text-white/80">
                            No active incident
                        </p>

                        <p className="mt-1 text-sm text-white/40">
                            Factory operations are within monitored thresholds.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                        Active Incident
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        {incident.id}
                    </h2>

                    <p className="mt-1 text-sm text-white/50">
                        Machine {incident.machineId}
                    </p>
                </div>

                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityClasses(incident.severity)}`}>
                    {incident.severity}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <p className="text-xs text-white/40">Status</p>
                    <p className="mt-1 text-sm font-medium text-white">
                        {incident.status}
                    </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <p className="text-xs text-white/40">Anomaly Score</p>
                    <p className="mt-1 text-sm font-medium text-white">
                        {incident.trigger.anomalyScore.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="mt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                    Trigger Signals
                </p>

                <div className="rounded-xl border border-white/5 bg-black/20 px-3">
                    {incident.trigger.signals.map((signal, index) => (
                        <SignalRow key={`${signal.metric}-${index}`} signal={signal}/>
                    ))}
                </div>
            </div>
        </section>
    );
}