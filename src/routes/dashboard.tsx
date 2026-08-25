import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, Copy, HelpCircle, Moon, Stethoscope } from "lucide-react";
import { Sidebar, Sparkline } from "@/components/hdis/primitives";
import { clinician, patient, riskBanner, scores } from "@/lib/hdis-data";
import { useSimulatedRisk } from "@/hooks/use-hdis-simulation";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "HDIS Clinical Workspace — ICU Copilot" },
      {
        name: "description",
        content:
          "HDIS clinical workspace: live vitals, deterioration risk, differential diagnoses and treatment simulation for the ICU bedside.",
      },
      { property: "og:title", content: "HDIS Clinical Workspace — ICU Copilot" },
      {
        property: "og:description",
        content:
          "Live vitals, deterioration risk, differential diagnoses and treatment simulation in one bedside view.",
      },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background p-3 text-foreground lg:p-5">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <Sidebar />
        <div className="min-w-0 flex-1 space-y-4">
          <TopBar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  const { risk, scores: liveScores } = useSimulatedRisk();
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-3">
        <div className="flex min-w-[220px] items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <Stethoscope className="size-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-tight">{patient.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {patient.age} y · {patient.sex} · {patient.bed}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              MRN: {patient.mrn}
              <Copy className="size-3" />
            </p>
          </div>
        </div>

        <button className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl bg-critical-soft px-4 py-3 text-left transition-opacity hover:opacity-90">
          <div className="w-14 shrink-0">
            <Sparkline series={risk.series} tone="critical" filled />
          </div>
          <span className="flex-1">
            <span className="block text-[12px] font-extrabold tracking-wide text-critical">
              {risk.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Detected {riskBanner.detectedAt} · {riskBanner.ago}
            </span>
          </span>
          <span className="text-critical">→</span>
        </button>

        <div className="flex items-center gap-5 pr-2">
          {liveScores.map((s) => (
            <div key={s.label} className="min-w-[62px] text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="text-2xl font-extrabold leading-tight">{s.value}</p>
              <p className="text-[11px] font-semibold text-critical">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
            <Stethoscope className="size-5" />
          </span>
          <div>
            <p className="text-[14px] font-bold leading-tight">{clinician.name}</p>
            <p className="text-[11px] text-muted-foreground">{clinician.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative grid size-9 place-items-center rounded-full border border-border text-muted-foreground">
            <Bell className="size-4" />
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-critical-foreground">
              {clinician.alerts}
            </span>
          </span>
          <span className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground">
            <HelpCircle className="size-4" />
          </span>
          <span className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground">
            <Moon className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
