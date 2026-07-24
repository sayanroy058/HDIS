import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { VitalTile } from "@/components/hdis/VitalTile";
import { AgentTrace } from "@/components/hdis/AgentTrace";
import { Button } from "@/components/ui/button";
import { sampleAt } from "@/lib/hdis/vitals";
import { demoPatient } from "@/lib/hdis/patient";
import {
  runDigitalTwin,
  runInvestigation,
  runLearning,
  runMonitoring,
  runRecommendation,
  runSafety,
  persistLearningRecord,
  summarizeLearning,
  type ClinicianDecision,
  type InvestigationReport,
  type LearningSummary,
  type MonitorReport,
  type Recommendation,
  type SafetyReport,
  type TwinReport,
} from "@/lib/hdis/pipeline";
import type {
  ClinicianChoice,
  Scenario,
  TraceEvent,
  VitalKey,
  VitalsSample,
} from "@/lib/hdis/types";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "HDIS — Live demo dashboard" },
      {
        name: "description",
        content:
          "Live demo of the HDIS prototype: simulated ICU vitals stream and a multi-agent reasoning trace with a clinician decision point.",
      },
      { property: "og:title", content: "HDIS — Live demo dashboard" },
      {
        property: "og:description",
        content: "Simulated ICU vitals + multi-agent reasoning trace. All data is synthetic.",
      },
    ],
  }),
  component: Demo,
});

const SCENARIOS: { id: Scenario; label: string; sub: string }[] = [
  { id: "stable", label: "Stable", sub: "Healthy baseline" },
  { id: "sepsis", label: "Deteriorating", sub: "Sepsis pattern" },
  { id: "recovering", label: "Recovering", sub: "Post-intervention" },
];

const VITAL_ORDER: VitalKey[] = ["hr", "sbp", "rr", "spo2", "temp", "mental"];

function formatClock(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Demo() {
  const [scenario, setScenario] = useState<Scenario>("sepsis");
  const [running, setRunning] = useState(true);
  const [t, setT] = useState(0);
  const [samples, setSamples] = useState<VitalsSample[]>([]);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [decision, setDecision] = useState<Record<string, ClinicianChoice | undefined>>({});
  const [learningSummary, setLearningSummary] = useState<LearningSummary | null>(null);
  const pipelineRef = useRef<{
    stage: number;
    startedAt: number;
    monitor?: MonitorReport;
    investigation?: InvestigationReport;
    twin?: TwinReport;
    recommendation?: Recommendation;
    safety?: SafetyReport;
    clinicianEventId?: string;
    logged?: boolean;
  }>({ stage: 0, startedAt: 0 });

  // Seed initial samples so charts have something to draw immediately.
  useEffect(() => {
    const init: VitalsSample[] = [];
    for (let i = 0; i < 8; i++) init.push(sampleAt(scenario, i));
    setSamples(init);
    setT(8);
    setEvents([]);
    setDecision({});
    pipelineRef.current = { stage: 0, startedAt: 0 };
  }, [scenario]);

  // 1 Hz tick
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setT((prev) => {
        const next = prev + 1;
        setSamples((s) => {
          const sample = sampleAt(scenario, next);
          const out = [...s, sample];
          // keep last 120 seconds
          return out.length > 120 ? out.slice(-120) : out;
        });
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, scenario]);

  // ------- Real pipeline driver -------
  // On every tick, run the monitoring agent on the current samples. If it
  // flags warning/critical, advance the downstream chain one stage per ~2s so
  // each agent's output feeds the next visibly.
  useEffect(() => {
    if (samples.length < 6) return;
    const monitor = runMonitoring(samples);
    if (!monitor) return;
    const p = pipelineRef.current;

    // Stage 0: idle until abnormal.
    if (p.stage === 0) {
      if (monitor.status === "normal") {
        // Emit a single reassurance event once we have enough data.
        if (t === 10) {
          setEvents((e) =>
            e.concat({
              id: "mon-ok",
              at: t,
              agent: "monitor",
              title: "Vitals within normal range",
              body: `Shock Index ${monitor.scores.shockIndex} · qSOFA ${monitor.scores.qsofa}. No alerts.`,
            }),
          );
        }
        return;
      }
      // Abnormal — start the pipeline.
      p.monitor = monitor;
      p.startedAt = t;
      p.stage = 1;
      setEvents((e) =>
        e.concat({
          id: "mon-alert",
          at: t,
          agent: "monitor",
          title: `${monitor.status === "critical" ? "Critical" : "Abnormal"} trend detected`,
          body: [
            ...monitor.alerts,
            `Shock Index ${monitor.scores.shockIndex}`,
            `qSOFA ${monitor.scores.qsofa} of 3`,
            ...monitor.trends.map(
              (tr) => `${tr.vital} ${tr.from.toFixed(0)} → ${tr.to.toFixed(0)}`,
            ),
          ].join(" · "),
        }),
      );
      return;
    }

    const elapsed = t - p.startedAt;

    if (p.stage === 1 && elapsed >= 2 && p.monitor) {
      const inv = runInvestigation(p.monitor, demoPatient);
      p.investigation = inv;
      p.stage = 2;
      setEvents((e) =>
        e.concat({
          id: "inv",
          at: t,
          agent: "investigate",
          title: `Top hypothesis: ${inv.top.name}`,
          body: `Evidence: ${inv.top.evidence.join("; ") || "clinical priors"}. Recommend: ${inv.top.testsRecommended.slice(0, 2).join(", ")}.`,
          detail: inv.hypotheses.map((h) => ({ label: h.name, value: h.confidence })),
        }),
      );
      return;
    }

    if (p.stage === 2 && elapsed >= 4 && p.investigation && p.monitor) {
      const twin = runDigitalTwin(p.investigation, p.monitor);
      p.twin = twin;
      p.stage = 3;
      setEvents((e) =>
        e.concat({
          id: "twin",
          at: t,
          agent: "twin",
          title: "Simulated treatment outcomes",
          body: `${twin.simulations.length} options simulated against qSOFA + Shock Index trajectory. Bars show predicted recovery probability.`,
          detail: twin.simulations.map((s) => ({ label: s.treatment.name, value: s.recoveryProb })),
        }),
      );
      return;
    }

    if (p.stage === 3 && elapsed >= 6 && p.twin) {
      const rec = runRecommendation(p.twin);
      p.recommendation = rec;
      p.stage = 4;
      setEvents((e) =>
        e.concat({
          id: "rec",
          at: t,
          agent: "recommend",
          title: `Recommended: ${rec.top.treatment.name}`,
          body: `Utility ${rec.top.utility} (recovery ${(rec.top.recoveryProb * 100).toFixed(0)}% − 0.35 × risk ${rec.top.riskScore}).`,
        }),
      );
      return;
    }

    if (p.stage === 4 && elapsed >= 8 && p.recommendation) {
      const safety = runSafety(p.recommendation, demoPatient);
      p.safety = safety;
      p.stage = 5;
      const title =
        safety.status === "approved"
          ? "Safety checks passed"
          : safety.status === "modified"
            ? `Modified: substituted to ${safety.approvedTreatment?.name}`
            : "Blocked by safety agent";
      setEvents((e) =>
        e.concat({
          id: "safety",
          at: t,
          agent: "safety",
          title,
          body: safety.notes.join(" · ") || "No allergy, interaction, or dosing issues detected.",
          detail: safety.checks.map((c) => ({
            label: `${c.name}${c.note ? " — " + c.note : ""}`,
            value: c.passed ? 1 : 0,
          })),
        }),
      );
      return;
    }

    if (p.stage === 5 && elapsed >= 10 && p.safety) {
      p.stage = 6;
      if (p.safety.status === "blocked" || !p.safety.approvedTreatment) {
        setEvents((e) =>
          e.concat({
            id: "clin-blocked",
            at: t,
            agent: "clinician",
            title: "Escalated to clinician — no safe option auto-approved",
            body: "Safety agent blocked all ranked treatments. Manual review required.",
          }),
        );
      } else {
        const id = "clin";
        p.clinicianEventId = id;
        setEvents((e) =>
          e.concat({
            id,
            at: t,
            agent: "clinician",
            title: `Awaiting clinician decision on: ${p.safety!.approvedTreatment!.name}`,
            body: "Human-in-the-loop sign-off before any intervention.",
            awaitsClinician: true,
          }),
        );
      }
    }
  }, [t, samples]);

  // Learning agent — fires once when clinician decides.
  useEffect(() => {
    const p = pipelineRef.current;
    if (p.logged || !p.clinicianEventId) return;
    const d = decision[p.clinicianEventId];
    if (!d || !p.monitor || !p.investigation || !p.safety) return;
    p.logged = true;
    const clinician: ClinicianDecision = {
      action: d.action,
      reason: d.reason?.trim() || undefined,
      modifiedTreatment: d.modifiedTreatment?.trim() || undefined,
      at: t,
    };
    const record = runLearning(demoPatient, p.monitor, p.investigation, p.safety, clinician);
    const log = persistLearningRecord(record);
    const summary = summarizeLearning(log);
    setLearningSummary(summary);
    const decisionLabel =
      d.action === "accept"
        ? "Accepted"
        : d.action === "modify"
          ? `Modified → ${record.appliedTreatment}`
          : "Rejected";
    setEvents((e) =>
      e.concat({
        id: "learn",
        at: t,
        agent: "learn",
        title: d.action === "accept" ? "Outcome logged" : `${decisionLabel} — logged for review`,
        body: [
          `Hypothesis ${record.topHypothesis}`,
          `Recommended ${record.recommendedTreatment}`,
          `Applied ${record.appliedTreatment}`,
          `Safety ${record.safetyStatus}`,
          `Clinician ${record.clinician.action}${d.reason ? ` ("${d.reason}")` : ""}`,
          ...summary.patterns.slice(0, 2),
        ].join(" · "),
      }),
    );
  }, [decision, t]);

  const reset = () => {
    setT(0);
    setSamples([]);
    setEvents([]);
    setDecision({});
    pipelineRef.current = { stage: 0, startedAt: 0 };
    setRunning(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Live demo
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight">
              Bedside monitor &amp; agent trace
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Synthetic ICU patient. Vitals stream at 1 Hz; agents react in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${running ? "animate-ping bg-primary opacity-60" : "bg-muted"}`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${running ? "bg-primary" : "bg-muted-foreground"}`}
              />
            </span>
            <span className="text-muted-foreground">{running ? "Streaming" : "Paused"}</span>
            <span className="font-mono tabular-nums text-foreground">{formatClock(t)}</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <section className="flex flex-col gap-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft font-mono text-base text-primary">
                    04
                  </div>
                  <div>
                    <p className="font-display text-lg leading-tight">Patient 04 · 62 F · Bed 7</p>
                    <p className="text-xs text-muted-foreground">
                      Post-op day 3 · Indwelling urinary catheter · NKDA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={running ? "secondary" : "default"}
                    onClick={() => setRunning((r) => !r)}
                  >
                    {running ? (
                      <>
                        <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3.5 w-3.5" /> Play
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={reset}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {SCENARIOS.map((s) => {
                  const active = scenario === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setScenario(s.id)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-background/60 hover:bg-secondary"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}
                      >
                        {s.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VITAL_ORDER.map((v) => (
                <VitalTile key={v} vital={v} samples={samples} />
              ))}
            </div>
          </section>

          <section className="min-h-[640px]">
            <AgentTrace
              events={events}
              decision={decision}
              onDecision={(id, choice) => setDecision((d) => ({ ...d, [id]: choice }))}
              learningSummary={learningSummary}
            />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
