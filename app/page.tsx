"use client";

import {
    useEffect,
    useState,
} from "react";

import { FactoryOverview } from "@/components/dashboard/FactoryOverview";
import { Header } from "@/components/dashboard/Header";

import type {
    PublicFactoryState,
} from "@/components/dashboard/types";

export default function Home() {
    const [factory, setFactory] = useState<PublicFactoryState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchFactory() {
            try {
                const response = await fetch("/api/factory", { cache: "no-store" });

                if (!response.ok) {
                    throw new Error(`Factory API returned ${response.status}`);
                }

                const data = (await response.json()) as PublicFactoryState;

                if (!cancelled) {
                    setFactory(data);
                    setError(null);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError instanceof Error ? loadError.message : "Failed to load factory state");
                }
            }
        }

        void fetchFactory();

        return () => {
            cancelled = true;
        };
    }, []);

    async function retryFactory() {
        setError(null);

        try {
            const response = await fetch("/api/factory", { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`Factory API returned ${response.status}`);
            }

            const data = (await response.json()) as PublicFactoryState;
            setFactory(data);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load factory state",
            );
        }
    }

    const loading = factory === null && error === null;

    return (
        <div className="min-h-screen bg-[#080c12] text-slate-100">
            <Header connected={!error && factory !== null} tick={factory?.simulation?.tick}/>

            <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
                {loading && (
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <p className="text-sm text-slate-500">
                            Connecting to factory simulator...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                        <p className="font-medium text-red-300">
                            Factory connection unavailable
                        </p>

                        <p className="mt-1 text-sm text-red-300/70">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                void retryFactory();
                            }}
                            className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/20"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {factory && !error && (
                    <div className="space-y-8">
                        <FactoryOverview factory={factory}/>

                        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                            <div className="min-h-64 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Active Incident
                                </p>

                                <p className="mt-8 text-sm text-slate-600">
                                    Incident intelligence will appear here.
                                </p>
                            </div>

                            <div className="min-h-64 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Agent Investigation
                                </p>

                                <p className="mt-8 text-sm text-slate-600">
                                    Cross-functional agent analysis will appear here.
                                </p>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}