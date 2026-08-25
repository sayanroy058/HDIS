import { createFileRoute } from "@tanstack/react-router";
import { Panel, PanelHead, Sparkline } from "@/components/hdis/primitives";
import type { Tone } from "@/components/hdis/primitives";
import { useSimulatedVitals } from "@/hooks/use-hdis-simulation";
import { vitals } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/trends")({
  component: TrendsPage,
});

const tone: Record<string, Tone> = {
  critical: "critical",
  warning: "warn",
  normal: "good",
};

const summary = [
  { label: "Risk score change (6h)", value: "+0.34", tone: "critical" as Tone },
  { label: "Fluid balance (24h)", value: "+1.8 L", tone: "warn" as Tone },
  { label: "Antibiotic time-to-dose", value: "38 min", tone: "good" as Tone },
  { label: "MAP time below 65", value: "72 min", tone: "critical" as Tone },
];

function TrendsPage() {
  const liveVitals = useSimulatedVitals();
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {summary.map((s) => (
        <Panel key={s.label}>
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
          <p className={`mt-1 text-2xl font-extrabold text-${s.tone}`}>{s.value}</p>
          <Sparkline series={[8, 12, 10, 16, 15, 21, 26]} tone={s.tone} filled />
        </Panel>
      ))}

      <Panel className="xl:col-span-4">
        <PanelHead title="24-Hour Parameter Trends" hint="All monitored parameters" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {liveVitals.map((v) => (
            <div key={v.key} className="rounded-xl border border-border p-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] font-bold">{v.label}</p>
                <p className="text-[12px] font-semibold">
                  {v.value}
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    {v.unit}
                  </span>
                </p>
              </div>
              <Sparkline
                series={v.series}
                tone={tone[v.status]}
                filled
                className="h-24"
              />
              <p className="text-[10px] text-muted-foreground">Reference {v.range}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
