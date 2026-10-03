interface HeaderProps {
    connected: boolean;
    tick?: number;
}

export function Header({ connected, tick }: HeaderProps) {
    return (
        <header className="border-b border-white/10 bg-[#080c12]/90 backdrop-blur">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                        R
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-semibold tracking-tight text-white">
                                REVORYX
                            </h1>

                            <span className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:inline">
                                Operations
                            </span>
                        </div>

                        <p className="text-xs text-slate-500">
                            Agentic AI for Coordinated Factory Recovery
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {tick !== undefined && (
                        <span className="hidden font-mono text-xs text-slate-500 sm:block">
                            TICK {tick}
                        </span>
                    )}

                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                        <span className={`h-2 w-2 rounded-full ${ connected ? "bg-emerald-400" : "bg-red-400" }`}/>

                        <span className="text-xs font-medium text-slate-300">
                            {connected ? "LIVE" : "DISCONNECTED"}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}