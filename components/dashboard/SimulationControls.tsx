interface SimulationControlsProps {
    simulation?: {
        active: boolean;
        tick: number;
    };
    busy: boolean;
    onStartScenario: () => Promise<void>;
    onAdvance: () => Promise<void>;
    onReset: () => Promise<void>;
}

export function SimulationControls({ simulation, busy, onStartScenario, onAdvance, onReset }: SimulationControlsProps) {
    return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                        Simulation Control
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-white">
                        Bearing Degradation Scenario
                    </h2>

                    <p className="mt-1 text-sm text-white/50">
                        Progressive bearing degradation on Extruder A · M-02
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {simulation?.active && (
                        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                            <span className="text-white/40">Tick </span>
                            <span className="font-semibold text-white">
                                {simulation.tick}
                            </span>
                        </div>
                    )}

                    {!simulation?.active ? (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onStartScenario()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Start Scenario
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onAdvance()}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Advance Tick
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onReset()}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </section>
    );
}