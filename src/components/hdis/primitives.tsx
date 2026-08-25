import { Link } from "@tanstack/react-router";
import {
  Activity,
  BellRing,
  ClipboardList,
  FileBarChart,
  Gauge,
  LayoutGrid,
  LineChart,
  Lightbulb,
  Microscope,
  Settings,
  Boxes,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHead({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

const toneMap = {
  critical: "text-critical",
  warn: "text-warn",
  good: "text-good",
  info: "text-info",
  primary: "text-primary",
} as const;

export type Tone = keyof typeof toneMap;

export function Sparkline({
  series,
  tone = "primary",
  className,
  filled = false,
}: {
  series: number[];
  tone?: Tone;
  className?: string;
  filled?: boolean;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full", toneMap[tone], className)}
      aria-hidden="true"
    >
      {filled ? (
        <polygon
          points={`0,${h} ${pts.join(" ")} ${w},${h}`}
          fill="currentColor"
          opacity="0.12"
        />
      ) : null}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Pill({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const bg = {
    critical: "bg-critical-soft text-critical",
    warn: "bg-warn-soft text-warn",
    good: "bg-good-soft text-good",
    info: "bg-info-soft text-info",
    primary: "bg-accent text-accent-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        bg,
      )}
    >
      {children}
    </span>
  );
}

const nav = [
  { label: "Overview", to: "/dashboard", icon: LayoutGrid },
  { label: "Monitoring", to: "/dashboard/monitoring", icon: Activity },
  { label: "Trends", to: "/dashboard/trends", icon: LineChart },
  { label: "Diagnostics", to: "/dashboard/diagnostics", icon: Microscope },
  { label: "Digital Twin", to: "/dashboard/digital-twin", icon: Boxes },
  { label: "Timeline", to: "/dashboard/timeline", icon: Gauge },
  { label: "Alerts", to: "/dashboard/alerts", icon: BellRing, badge: 2 },
  { label: "Orders", to: "/dashboard/orders", icon: ClipboardList },
  { label: "Reports", to: "/dashboard/reports", icon: FileBarChart },
  { label: "Learned Insights", to: "/dashboard/insights", icon: Lightbulb },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-[212px] shrink-0 flex-col gap-4 lg:flex">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Activity className="size-5" />
        </span>
        <span>
          <span className="block text-xl font-extrabold leading-none tracking-tight">
            HDIS
          </span>
          <span className="text-[11px] text-muted-foreground">ICU Copilot</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 rounded-2xl border border-border bg-card p-3">
        {nav.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            activeOptions={{ exact: item.to === "/dashboard" }}
            activeProps={{
              className: "bg-accent text-accent-foreground font-semibold",
            }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors"
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {"badge" in item && item.badge ? (
              <span className="grid size-5 place-items-center rounded-full bg-critical text-[10px] font-bold text-critical-foreground">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="text-[12px] font-semibold">System Status</p>
        <p className="text-[11px] text-good">All Systems Operational</p>
        <Sparkline series={[8, 14, 9, 18, 11, 20, 12, 22, 10, 16]} tone="good" />
      </div>
    </aside>
  );
}
