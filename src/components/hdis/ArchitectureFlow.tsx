import {
  Activity,
  Search,
  GitBranch,
  Sparkles,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Waves,
} from "lucide-react";

type Node = {
  name: string;
  desc: string;
  Icon: typeof Activity;
  state: "done" | "active" | "planned";
};

const nodes: Node[] = [
  { name: "Patient Data Stream", desc: "Synthetic ICU vitals: HR, BP, RR, SpO₂, temperature, mental status.", Icon: Waves, state: "done" },
  { name: "Monitoring Agent", desc: "Continuously watches the vitals stream and flags abnormal trends.", Icon: Activity, state: "planned" },
  { name: "Investigation Agent", desc: "Reasons over patient history and meds to hypothesise root cause.", Icon: Search, state: "planned" },
  { name: "Digital Twin Simulator", desc: "Counterfactual outcomes per intervention via qSOFA + Shock Index.", Icon: GitBranch, state: "active" },
  { name: "Recommendation Agent", desc: "Ranks interventions by predicted recovery and selects a course.", Icon: Sparkles, state: "planned" },
  { name: "Safety Agent", desc: "Validates against allergies, interactions, and contraindications.", Icon: ShieldCheck, state: "planned" },
  { name: "Clinician Review", desc: "Human-in-the-loop final accept / reject. The system never auto-treats.", Icon: UserCheck, state: "planned" },
  { name: "Learning Agent", desc: "Logs the decision and outcome to improve future recommendations.", Icon: BookOpen, state: "planned" },
];

const stateChip: Record<Node["state"], string> = {
  done: "bg-success/15 text-success-foreground border-success/30",
  active: "bg-warning/15 text-warning-foreground border-warning/30",
  planned: "bg-secondary text-muted-foreground border-border",
};
const stateLabel: Record<Node["state"], string> = {
  done: "Done",
  active: "In progress",
  planned: "Planned",
};

export function ArchitectureFlow() {
  return (
    <ol className="relative space-y-3">
      {nodes.map((n, i) => (
        <li key={n.name} className="relative">
          <div className="flex items-stretch gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col items-center">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <n.Icon className="h-5 w-5" />
              </div>
              <span className="mt-1 font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg leading-tight">{n.name}</h3>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${stateChip[n.state]}`}>
                  {stateLabel[n.state]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
            </div>
          </div>
          {i < nodes.length - 1 && (
            <div aria-hidden className="ml-9 flex h-4 items-center justify-start">
              <div className="h-full w-px bg-border" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}