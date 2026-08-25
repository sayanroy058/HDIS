import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PanelHead, Pill, Sparkline } from "@/components/hdis/primitives";
import type { Tone } from "@/components/hdis/primitives";
import { useSimulatedVitals } from "@/hooks/use-hdis-simulation";
import { vitals, wards, watchlist } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/monitoring")({
  component: MonitoringPage,
});

const tone: Record<string, Tone> = {
  critical: "critical",
  warning: "warn",
  normal: "good",
};

function MonitoringPage() {
  const liveVitals = useSimulatedVitals();
  const [active, setActive] = useState(vitals[0].key);
  const current = liveVitals.find((v) => v.key === active) ?? liveVitals[0];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2">
        <PanelHead title="Continuous Monitoring" hint="Select a parameter to expand" />
        <div className="mb-4 flex flex-wrap gap-2">
          {liveVitals.map((v) => (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active === v.key
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground">
                {current.label} ({current.unit})
              </p>
              <p className="text-4xl font-extrabold">{current.value}</p>
              <p className="text-[11px] text-muted-foreground">
                Reference {current.range}
              </p>
            </div>
            <Pill tone={tone[current.status]}>{current.status}</Pill>
          </div>
          <div className="mt-4">
            <Sparkline
              series={current.series}
              tone={tone[current.status]}
              filled
              className="h-40"
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Unit Occupancy" hint="Live bed census" />
        <ul className="space-y-3">
          {wards.map((w) => (
            <li key={w.unit} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between text-[13px] font-semibold">
                <span>{w.unit}</span>
                <span>
                  {w.occupied}/{w.beds}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(w.occupied / w.beds) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {w.highRisk} high-risk patients
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="xl:col-span-3">
        <PanelHead title="Deterioration Watchlist" hint="Ranked by composite risk score" />
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2">Patient</th>
                <th className="py-2">Bed</th>
                <th className="py-2">Risk</th>
                <th className="py-2">Score</th>
                <th className="py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="py-2.5 font-semibold">{p.name}</td>
                  <td className="py-2.5 text-muted-foreground">{p.bed}</td>
                  <td className="py-2.5">
                    <Pill
                      tone={
                        p.risk === "High" ? "critical" : p.risk === "Moderate" ? "warn" : "good"
                      }
                    >
                      {p.risk}
                    </Pill>
                  </td>
                  <td className="py-2.5 tabular-nums">{p.score.toFixed(2)}</td>
                  <td className="w-32 py-2.5">
                    <Sparkline
                      series={[0.2, 0.3, 0.28, 0.42, 0.5, 0.62, p.score]}
                      tone={p.risk === "High" ? "critical" : "info"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
