import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Info } from "lucide-react";
import { Panel, PanelHead, Pill } from "@/components/hdis/primitives";
import { diagnoses, evidence, missingInfo } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/diagnostics")({
  component: DiagnosticsPage,
});

const rationale: Record<string, string> = {
  "Sepsis / Septic Shock":
    "Fever, tachycardia, hypotension and rising lactate with a plausible central-line source on day 3.",
  Hypovolemia:
    "Low MAP with reduced urine output, though fever and lactate favour a septic driver.",
  "Pulmonary Embolism":
    "Tachypnea and hypoxia are compatible, but no DVT signs or immobilisation history.",
  "Cardiogenic Shock":
    "No JVD, oedema or ischaemic ECG changes; cardiac history absent.",
  "Tension Pneumothorax":
    "Bilateral breath sounds present and trachea midline on exam.",
};

function DiagnosticsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2">
        <PanelHead
          title="Differential Diagnoses"
          hint="Ranked with model rationale · demo data"
        />
        <ul className="space-y-3">
          {diagnoses.map((d, i) => (
            <li key={d.name} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-muted text-[11px] font-bold">
                  {i + 1}
                </span>
                <p className="flex-1 text-[13px] font-bold">{d.name}</p>
                <Pill tone={i === 0 ? "critical" : i === 1 ? "warn" : "info"}>
                  {d.pct}%
                </Pill>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${i === 0 ? "bg-critical" : i === 1 ? "bg-warn" : "bg-info"}`}
                  style={{ width: `${Math.max(d.pct, 3)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {rationale[d.name]}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHead title="Supporting Evidence" />
          <ul className="space-y-2">
            {evidence.supporting.map((e) => (
              <li key={e} className="flex gap-2 text-[12px]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-good" />
                {e}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <PanelHead title="Conflicting / Uncertain" />
          <ul className="space-y-2">
            {evidence.against.map((e) => (
              <li key={e} className="flex gap-2 text-[12px]">
                <Info className="mt-0.5 size-4 shrink-0 text-warn" />
                {e}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <PanelHead title="Recommended Workup" />
          <ul className="space-y-2">
            {missingInfo.map((m) => (
              <li
                key={m.name}
                className="flex items-center justify-between gap-2 text-[12px]"
              >
                <span>{m.name}</span>
                <Pill
                  tone={
                    m.priority === "High"
                      ? "critical"
                      : m.priority === "Medium"
                        ? "warn"
                        : "info"
                  }
                >
                  {m.priority}
                </Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
