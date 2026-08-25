import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PanelHead, Pill, Sparkline } from "@/components/hdis/primitives";
import { recommendation, simulations } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/digital-twin")({
  component: DigitalTwinPage,
});

const detail = [
  { label: "Projected MAP at 6h", values: ["71 mmHg", "67 mmHg", "63 mmHg", "60 mmHg"] },
  { label: "Projected lactate at 6h", values: ["2.4", "3.1", "3.6", "4.4"] },
  { label: "Vasopressor need", values: ["Low", "Moderate", "Moderate", "High"] },
  { label: "ICU LOS estimate", values: ["4.2 d", "5.6 d", "6.4 d", "7.8 d"] },
];

function DigitalTwinPage() {
  const [selected, setSelected] = useState(0);
  const horizon = ["2 h", "6 h", "12 h", "24 h"];
  const [h, setH] = useState("6 h");

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-3">
        <PanelHead
          title="Digital Twin – Treatment Simulation"
          hint="Counterfactual outcome modelling on a virtual patient replica"
          action={
            <div className="inline-flex rounded-lg bg-muted p-1 text-[11px]">
              {horizon.map((o) => (
                <button
                  key={o}
                  onClick={() => setH(o)}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    h === o ? "bg-card shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {simulations.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSelected(i)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                selected === i ? "border-primary bg-accent/40" : "border-border hover:bg-muted"
              }`}
            >
              {s.recommended ? <Pill tone="good">Recommended</Pill> : null}
              <p className="mt-2 text-[13px] font-bold">{s.title}</p>
              <p className="text-[11px] text-muted-foreground">{s.subtitle}</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{s.pct}%</p>
              <p className="text-[10px] text-muted-foreground">
                Probability of stabilization within {h}
              </p>
              <Sparkline series={s.series} tone={i === 0 ? "good" : "primary"} filled className="h-20" />
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="xl:col-span-2">
        <PanelHead title="Projected Outcomes" hint={`Scenario: ${simulations[selected].title}`} />
        <table className="w-full text-[12px]">
          <tbody>
            {detail.map((d) => (
              <tr key={d.label} className="border-t border-border first:border-0">
                <td className="py-2.5 text-muted-foreground">{d.label}</td>
                <td className="py-2.5 text-right font-semibold">
                  {d.values[selected]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel>
        <PanelHead title="Model Confidence" />
        <p className="text-4xl font-extrabold text-primary">
          {recommendation.confidence}%
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${recommendation.confidence}%` }}
          />
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Confidence reflects data completeness, physiologic signal stability and
          concordance with sepsis guidelines. Simulations are decision support only.
        </p>
      </Panel>
    </div>
  );
}
