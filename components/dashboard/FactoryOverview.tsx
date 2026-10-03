import { MachineCard } from "./MachineCard";
import type { PublicFactoryState } from "./types";

interface FactoryOverviewProps {
    factory: PublicFactoryState;
}

export function FactoryOverview({ factory }: FactoryOverviewProps) {
    const runningMachines = factory.machines.filter((machine) => machine.status === "RUNNING").length;

    return (
        <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                        Factory Overview
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        Production Line
                    </h2>
                </div>

                <div className="flex gap-6 text-sm">
                    <Summary label="Running" value={`${runningMachines}/${factory.machines.length}`}/>
                    <Summary label="Output" value={`${factory.totalOutput}/h`}/>
                    <Summary label="Utilization" value={`${factory.averageUtilization}%`}/>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {factory.machines.map((machine) => (
                    <MachineCard key={machine.id} machine={machine}/>
                ))}
            </div>
        </section>
    );
}

function Summary({ label, value }: { label: string; value: string; }) {
    return (
        <div className="text-right">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 font-mono text-sm font-medium text-slate-200">
                {value}
            </p>
        </div>
    );
}