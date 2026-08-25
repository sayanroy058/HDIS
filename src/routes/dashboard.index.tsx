import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Info,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelHead, Pill, Sparkline } from "@/components/hdis/primitives";
import type { Tone } from "@/components/hdis/primitives";
import { useSimulatedVitals } from "@/hooks/use-hdis-simulation";
import {
  diagnoses,
  evidence,
  missingInfo,
  recommendation,
  safetyChecks,
  simulations,
  timeline,
  vitals,
  whyNow,
} from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

const statusTone: Record<string, Tone> = {
  critical: "critical",
  warning: "warn",
  normal: "good",
};

function OverviewPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="xl:col-span-4"><LiveVitals /></div>
      <div className="xl:col-span-4"><WhyNow /></div>
      <div className="xl:col-span-4"><TopDiagnoses /></div>
      <div className="xl:col-span-5"><EvidencePanel /></div>
      <div className="xl:col-span-4"><DigitalTwin /></div>
      <div className="xl:col-span-3"><TimelinePanel /></div>
      <DecisionRow />
    </div>
  );
}

function LiveVitals() {
  const liveVitals = useSimulatedVitals();
  const [window, setWindow] = useState("Last 30 min");
  return (
    <Panel>
      <PanelHead
        title="Live Vitals"
        action={
          <select
            value={window}
            onChange={(e) => setWindow(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
          >
            {["Last 30 min", "Last 2 hours", "Last 12 hours", "Last 24 hours"].map(
              (o) => (
                <option key={o}>{o}</option>
              ),
            )}
          </select>
        }
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
        {liveVitals.map((v) => (
          <div key={v.key} className="rounded-xl border border-border p-2.5">
            <p className="text-[11px] font-semibold">
              {v.label}{" "}
              <span className="font-normal text-muted-foreground">{v.unit}</span>
            </p>
            <p className="mt-1 text-[26px] font-extrabold leading-none">{v.value}</p>
            <Sparkline series={v.series} tone={statusTone[v.status]} />
            <p className="text-[10px] text-muted-foreground">{v.range}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function WhyNow() {
  return (
    <Panel className="flex flex-col">
      <PanelHead title="Why Now?" hint="What changed in the last 15 minutes" />
      <ul className="flex-1 space-y-1 rounded-xl border border-border p-2">
        {whyNow.map((w) => (
          <li
            key={w.text}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-[12px] hover:bg-muted"
          >
            <span className="flex-1">{w.text}</span>
            {w.trend === "up" ? (
              <ArrowUp className="size-4 text-critical" />
            ) : (
              <ArrowDown className="size-4 text-critical" />
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-critical-soft p-3">
        <div>
          <p className="text-[11px] font-semibold">Overall Deterioration Risk</p>
          <p className="text-xl font-extrabold text-critical">HIGH</p>
        </div>
        <div className="flex-1">
          <Sparkline series={[10, 18, 16, 28, 24, 38, 48, 58, 74]} tone="critical" />
        </div>
      </div>
    </Panel>
  );
}

function TopDiagnoses() {
  return (
    <Panel>
      <PanelHead
        title="Top Diagnoses"
        hint="Differential ranking · model generated"
        action={
          <Link
            to="/dashboard/diagnostics"
            className="text-[11px] font-semibold text-primary"
          >
            View all
          </Link>
        }
      />
      <ol className="space-y-3">
        {diagnoses.map((d, i) => (
          <li key={d.name}>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="w-3 text-muted-foreground">{i + 1}</span>
              <span className="flex-1 font-medium">{d.name}</span>
              <span className="font-semibold">{d.pct}%</span>
            </div>
            <div className="ml-5 mt-1 h-1.5 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${i === 0 ? "bg-critical" : i === 1 ? "bg-warn" : "bg-info"}`}
                style={{ width: `${Math.max(d.pct, 3)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <Link
        to="/dashboard/diagnostics"
        className="mt-4 block text-right text-[11px] font-semibold text-primary"
      >
        See supporting &amp; conflicting evidence →
      </Link>
    </Panel>
  );
}

function EvidencePanel() {
  const [tab, setTab] = useState<"supporting" | "against">("supporting");
  const items = tab === "supporting" ? evidence.supporting : evidence.against;
  return (
    <Panel className="grid min-w-0 gap-4 p-4 sm:grid-cols-2">
      <div>
        <PanelHead title="Evidence" />
        <div className="mb-3 inline-flex rounded-lg bg-muted p-1 text-[11px]">
          {(["supporting", "against"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 font-semibold capitalize ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t === "against" ? "Against / Uncertainty" : "Supporting"}
            </button>
          ))}
        </div>
        <ul className="space-y-2.5">
          {items.map((e) => (
            <li key={e} className="flex items-start gap-2 text-[12px]">
              {tab === "supporting" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-good" />
              ) : (
                <Info className="mt-0.5 size-4 shrink-0 text-warn" />
              )}
              <span className="leading-5">{e}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <PanelHead title="Missing Information" />
        <ul className="space-y-2">
          {missingInfo.map((m) => (
            <li
              key={m.name}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2 text-[11px]"
            >
              <span className="min-w-0 leading-4">{m.name}</span>
              <Pill
                tone={
                  m.priority === "High" ? "critical" : m.priority === "Medium" ? "warn" : "info"
                }
              >
                {m.priority}
              </Pill>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] font-semibold text-primary">
          These tests may reduce uncertainty →
        </p>
      </div>
    </Panel>
  );
}

function DigitalTwin() {
  const [selected, setSelected] = useState(0);
  return (
    <Panel>
      <PanelHead
        title="Digital Twin – Treatment Simulation"
        hint="Compare likely outcomes"
      />
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-2">
        {simulations.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setSelected(i)}
            className={`min-w-0 rounded-xl border p-2.5 text-left transition-colors ${
              selected === i ? "border-good bg-good-soft/50" : "border-border hover:bg-muted"
            }`}
          >
            {s.recommended ? (
              <span className="mb-2 inline-block rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-bold text-good">
                Recommended
              </span>
            ) : null}
            <p className="text-[12px] font-bold leading-4">{s.title}</p>
            <p className="text-[10px] text-muted-foreground">{s.subtitle}</p>
            <p className="mt-2 text-[26px] font-extrabold leading-none text-primary">
              {s.pct}%
            </p>
            <p className="text-[10px] leading-4 text-muted-foreground">
              Probability of Stabilization
            </p>
            <Sparkline series={s.series} tone={i === 0 ? "good" : "primary"} filled />
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-semibold">Model Confidence</span>
        <span className="h-1.5 w-40 rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${recommendation.confidence}%` }}
          />
        </span>
        <span className="font-semibold text-foreground">
          {recommendation.confidence}%
        </span>
        <span className="ml-auto">How is this calculated?</span>
      </div>
      <Link
        to="/dashboard/digital-twin"
        className="mt-2 block text-center text-[11px] font-semibold text-primary"
      >
        View Simulation Details →
      </Link>
    </Panel>
  );
}

const timelineDot: Record<string, string> = {
  good: "bg-good",
  info: "bg-info",
  warn: "bg-warn",
  alert: "bg-critical",
};

function TimelinePanel() {
  return (
    <Panel>
      <PanelHead
        title="Patient Timeline"
        action={
          <Link
            to="/dashboard/timeline"
            className="text-[11px] font-semibold text-primary"
          >
            View full timeline
          </Link>
        }
      />
      <ul className="space-y-2">
        {timeline.map((t) => (
          <li key={t.time} className="flex items-start gap-2 text-[12px]">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${timelineDot[t.tone]}`} />
            <span className="w-11 shrink-0 tabular-nums text-muted-foreground">
              {t.time}
            </span>
            <span
              className={`min-w-0 flex-1 rounded-lg px-2 py-1 leading-5 ${
                t.tone === "alert" ? "bg-critical-soft text-critical" : ""
              }`}
            >
              <span className="font-semibold">{t.label}</span>{" "}
              <span className={t.tone === "alert" ? "" : "text-muted-foreground"}>
                {t.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function DecisionRow() {
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<string | null>(null);

  const record = (choice: string) => {
    setDecision(choice);
    toast.success(`Decision recorded: ${choice}`, {
      description: note ? `Note: ${note}` : "No additional note",
    });
  };

  return (
    <Panel className="xl:col-span-12">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr_1.35fr_1.1fr]">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[13px] font-bold">
            <ShieldCheck className="size-4 text-primary" /> Safety Check
          </p>
          <ul className="grid gap-1.5 text-[11px] sm:grid-cols-2">
            {safetyChecks.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {c.ok ? (
                  <Check className="size-3.5 shrink-0 text-good" />
                ) : (
                  <X className="size-3.5 shrink-0 text-warn" />
                )}
                <span className="flex-1 truncate">{c.label}</span>
                <span className="text-muted-foreground">{c.result}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-[13px] font-bold">
            <Sparkles className="size-4 text-primary" /> HDIS Recommendation
          </p>
          <p className="text-[12px] font-semibold">{recommendation.headline}</p>
          <ol className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
            {recommendation.actions.map((a, i) => (
              <li key={a}>
                {i + 1}. {a}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] font-semibold text-primary">
            View full recommendation →
          </p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-[13px] font-bold">
            <UserRound className="size-4 text-primary" /> Physician Decision
          </p>
          <div className="flex gap-2">
            {["Accept", "Modify", "Reject"].map((c) => (
              <button
                key={c}
                onClick={() => record(c)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                  decision === c
                    ? "border-good bg-good-soft text-good"
                    : "border-border hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="mt-2 block text-[11px] text-muted-foreground">
            Add Note (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Type your note here..."
              className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-2 py-1.5 text-[12px] text-foreground"
            />
          </label>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <button
            onClick={() =>
              decision
                ? toast.success("Decision saved to patient record (demo)")
                : toast.error("Select Accept, Modify or Reject first")
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CheckCircle2 className="size-4" /> Confirm &amp; Save Decision
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            Final decision always with physician
          </p>
        </div>
      </div>
    </Panel>
  );
}
