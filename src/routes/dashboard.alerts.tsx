import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Panel, PanelHead, Pill } from "@/components/hdis/primitives";
import { alerts } from "@/lib/hdis-data";

export const Route = createFileRoute("/dashboard/alerts")({
  component: AlertsPage,
});

function AlertsPage() {
  const [acked, setAcked] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const shown =
    filter === "All" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <Panel>
      <PanelHead
        title="Alerts"
        hint="Model and threshold alerts for this patient"
        action={
          <div className="inline-flex rounded-lg bg-muted p-1 text-[11px]">
            {["All", "Critical", "Warning", "Info"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  filter === f ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />
      <ul className="space-y-2">
        {shown.map((a) => (
          <li
            key={a.title}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
          >
            <Pill
              tone={
                a.severity === "Critical"
                  ? "critical"
                  : a.severity === "Warning"
                    ? "warn"
                    : "info"
              }
            >
              {a.severity}
            </Pill>
            <div className="min-w-[220px] flex-1">
              <p className="text-[13px] font-semibold">{a.title}</p>
              <p className="text-[11px] text-muted-foreground">{a.detail}</p>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {a.time}
            </span>
            <button
              disabled={acked.includes(a.title)}
              onClick={() => {
                setAcked((p) => [...p, a.title]);
                toast.success("Alert acknowledged");
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-muted disabled:opacity-50"
            >
              {acked.includes(a.title) ? "Acknowledged" : "Acknowledge"}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
