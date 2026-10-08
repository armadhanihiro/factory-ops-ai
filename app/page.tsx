"use client";

import {
  useEffect,
  useState,
} from "react";

import { FactoryOverview } from "@/components/dashboard/FactoryOverview";
import { Header } from "@/components/dashboard/Header";
import type { OrchestrationResult, PublicFactoryState, RecoveryAnalysisResult, DecisionSupportResult } from "@/components/dashboard/types";
import { ActiveIncident } from "@/components/dashboard/ActiveIncident";
import { SimulationControls } from "@/components/dashboard/SimulationControls";
import { AgentInvestigation } from "@/components/dashboard/AgentInvestigation";
import { RecoveryPlanning } from "@/components/dashboard/RecoveryPlanning";
import DecisionSupport from "@/components/dashboard/DecisionSupport";

export default function Home() {
  const [factory, setFactory] = useState<PublicFactoryState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [investigation, setInvestigation] = useState<OrchestrationResult | null>(null);
  const [investigating, setInvestigating] = useState(false);
  const [investigationError, setInvestigationError] = useState<string | null>(null);
  const [recoveryAnalysis, setRecoveryAnalysis] = useState<RecoveryAnalysisResult | null>(null);
  const [analyzingRecovery, setAnalyzingRecovery] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [decisionSupport, setDecisionSupport] = useState<DecisionSupportResult | null>(null);
  const [generatingDecisionSupport, setGeneratingDecisionSupport] = useState(false);
  const [decisionSupportError, setDecisionSupportError] = useState<string | null>(null);

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

  async function loadFactory() {
    const response = await fetch("/api/factory", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Factory API returned ${response.status}`);
    }

    const data = (await response.json()) as PublicFactoryState;

    setFactory(data);
    setError(null);
  }

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
      setError(loadError instanceof Error ? loadError.message : "Failed to load factory state");
    }
  }

  async function startScenario() {
    setBusy(true);

    try {
      const response = await fetch("/api/factory/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "BEARING_DEGRADATION",
        }),
      });

      if (!response.ok) {
        throw new Error(`Scenario API returned ${response.status}`);
      }

      await loadFactory();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to start scenario");
    } finally {
      setBusy(false);
    }
  }

  async function advanceSimulation() {
    setBusy(true);

    try {
      const response = await fetch("/api/factory/tick", { method: "POST" });

      if (!response.ok) {
        throw new Error(`Factory tick returned ${response.status}`);
      }

      const data = (await response.json()) as PublicFactoryState;

      setFactory(data);
      setError(null);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to advance simulation");
    } finally {
      setBusy(false);
    }
  }

  async function resetSimulation() {
    setBusy(true);

    try {
      const response = await fetch("/api/factory/reset", { method: "POST" });

      if (!response.ok) {
        throw new Error(`Factory reset returned ${response.status}`);
      }

      setInvestigation(null);
      setInvestigationError(null);
      setRecoveryAnalysis(null);
      setRecoveryError(null);
      setDecisionSupport(null);
      setDecisionSupportError(null);

      await loadFactory();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to reset simulation");
    } finally {
      setBusy(false);
    }
  }

  async function investigateIncident() {
    const activeIncident = factory?.incidents.find((incident) => incident.status !== "RESOLVED");

    if (!activeIncident) {
      setInvestigationError("No active incident available for investigation.");
      return;
    }

    setInvestigating(true);
    setInvestigationError(null);
    setRecoveryAnalysis(null);
    setRecoveryError(null);
    setDecisionSupport(null);
    setDecisionSupportError(null);

    try {
      const response = await fetch(
        `/api/orchestrate/${activeIncident.id}`,
        {
            method: "GET",
            cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Incident investigation failed.");
      }

      setInvestigation(data as OrchestrationResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Incident investigation failed.";

      setInvestigationError(message);
    } finally {
      setInvestigating(false);
    }
  }

  async function analyzeRecovery() {
    if (!investigation) {
      setRecoveryError("Complete the incident investigation first.");
      return;
    }

    setAnalyzingRecovery(true);
    setRecoveryError(null);

    try {
      const response = await fetch(
        `/api/recovery/${investigation.incidentId}/analysis`,
        {
            method: "GET",
            cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Recovery analysis failed.");
      }

      setRecoveryAnalysis(data as RecoveryAnalysisResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Recovery analysis failed.";
      setRecoveryError(message);
    } finally {
      setAnalyzingRecovery(false);
    }
  }

  async function generateDecisionSupport() {
    if (!recoveryAnalysis) {
      setDecisionSupportError("Generate recovery plans first.");
      return;
    }

    setGeneratingDecisionSupport(true);
    setDecisionSupportError(null);

    try {
      const response = await fetch(
        `/api/recovery/${recoveryAnalysis.incidentId}/decision-support`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Decision support generation failed.");
      }

      setDecisionSupport(data as DecisionSupportResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Decision support generation failed.";
      setDecisionSupportError(message);
    } finally {
      setGeneratingDecisionSupport(false);
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
            <SimulationControls
              simulation={factory.simulation}
              busy={busy}
              onStartScenario={startScenario}
              onAdvance={advanceSimulation}
              onReset={resetSimulation}
            />

            <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <ActiveIncident incidents={factory.incidents}/>
              <AgentInvestigation
                incident={factory.incidents.find((incident) => incident.status !== "RESOLVED") ?? null}
                result={investigation}
                investigating={investigating}
                error={investigationError}
                onInvestigate={investigateIncident}
              />
            </section>

            <RecoveryPlanning
              result={recoveryAnalysis}
              analyzing={analyzingRecovery}
              error={recoveryError}
              investigationComplete={investigation?.status === "COMPLETED"}
              onAnalyze={analyzeRecovery}
            />

            <DecisionSupport
              result={decisionSupport}
              recoveryAnalysis={recoveryAnalysis}
              loading={generatingDecisionSupport}
              error={decisionSupportError}
              onGenerate={generateDecisionSupport}
            />
          </div>
        )}
      </main>
    </div>
  );
}