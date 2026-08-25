import { createFileRoute } from "@tanstack/react-router";
import { Panel, PanelHead } from "@/components/hdis/primitives";
import { timeline } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/timeline")({
  component: TimelinePage,
});

const earlier = [
  { time: "08:40", label: "Nursing note", detail: "Patient reports chills", tone: "info" },
  { time: "07:30", label: "Labs", detail: "WBC 16.2 ×10⁹/L", tone: "warn" },
  { time: "06:00", label: "Central line", detail: "Day 3 dressing change", tone: "info" },
  { time: "Day 1", label: "Admission", detail: "Community acquired pneumonia", tone: "info" },
] as const;

const dot: Record<string, string> = {
  good: "bg-good",
  info: "bg-info",
  warn: "bg-warn",
  alert: "bg-critical",
};

function TimelinePage() {
  const all = [...timeline, ...earlier];
  return (
    <Panel>
      <PanelHead title="Full Patient Timeline" hint="Events, orders and model alerts" />
      <ol className="relative space-y-4 border-l border-border pl-5">
        {all.map((t) => (
          <li key={`${t.time}-${t.label}`} className="relative">
            <span
              className={`absolute -left-[26px] top-1.5 size-2.5 rounded-full ${dot[t.tone]}`}
            />
            <div
              className={`rounded-xl border border-border p-3 ${
                t.tone === "alert" ? "border-critical/40 bg-critical-soft" : ""
              }`}
            >
              <p className="text-[11px] tabular-nums text-muted-foreground">{t.time}</p>
              <p
                className={`text-[13px] font-semibold ${t.tone === "alert" ? "text-critical" : ""}`}
              >
                {t.label}
              </p>
              {t.detail ? (
                <p className="text-[12px] text-muted-foreground">{t.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
