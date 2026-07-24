import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { vitalMeta } from "@/lib/hdis/vitals";
import type { VitalKey, VitalsSample } from "@/lib/hdis/types";

const statusStyles = {
  ok: { ring: "border-border", dot: "bg-success", text: "text-foreground", stroke: "var(--primary)" },
  warn: { ring: "border-warning/50", dot: "bg-warning", text: "text-warning-foreground", stroke: "var(--warning)" },
  crit: { ring: "border-destructive/60", dot: "bg-destructive", text: "text-destructive", stroke: "var(--destructive)" },
};

export function VitalTile({
  vital,
  samples,
}: {
  vital: VitalKey;
  samples: VitalsSample[];
}) {
  const meta = vitalMeta[vital];
  const last = samples[samples.length - 1];
  const value = last ? (last as any)[vital] : 0;
  const status = meta.status(value);
  const s = statusStyles[status];
  const data = samples.slice(-60).map((d) => ({ v: (d as any)[vital] }));

  return (
    <div className={`flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors ${s.ring}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {status === "ok" ? "Normal" : status === "warn" ? "Watch" : "Critical"}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-3xl font-medium tabular-nums ${s.text}`}>{meta.format(value)}</span>
        <span className="text-xs text-muted-foreground">{meta.unit}</span>
      </div>
      <div className="h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <Line type="monotone" dataKey="v" stroke={s.stroke} strokeWidth={1.75} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-muted-foreground">Normal {meta.range}</div>
    </div>
  );
}