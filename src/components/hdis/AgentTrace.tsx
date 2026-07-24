import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  BookOpen,
  GitBranch,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { agentMeta } from "@/lib/hdis/scenario";
import type { AgentKind, ClinicianChoice, TraceEvent } from "@/lib/hdis/types";
import type { LearningSummary } from "@/lib/hdis/pipeline";

const icons: Record<AgentKind, typeof Activity> = {
  monitor: Activity,
  investigate: Search,
  twin: GitBranch,
  recommend: Sparkles,
  safety: ShieldCheck,
  clinician: UserCheck,
  learn: BookOpen,
};

const toneClasses: Record<string, string> = {
  neutral: "bg-secondary text-foreground",
  warn: "bg-warning/15 text-warning-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-success/15 text-success-foreground",
};

function formatT(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function AgentTrace({
  events,
  onDecision,
  decision,
  learningSummary,
}: {
  events: TraceEvent[];
  onDecision: (id: string, choice: ClinicianChoice) => void;
  decision: Record<string, ClinicianChoice | undefined>;
  learningSummary?: LearningSummary | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="font-display text-base leading-tight">Agent reasoning trace</h2>
          <p className="text-xs text-muted-foreground">Live multi-agent chain-of-reasoning</p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{events.length} events</span>
      </div>
      <div className="relative flex-1 overflow-y-auto px-4 py-4">
        {events.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <div className="mx-auto mb-3 h-2 w-2 animate-pulse rounded-full bg-primary" />
              Waiting for trend signals…
            </div>
          </div>
        ) : (
          <ol className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((e) => {
                const Icon = icons[e.agent];
                const meta = agentMeta[e.agent];
                const d = decision[e.id];
                return (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-lg border border-border bg-background/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] ${toneClasses[meta.tone]}`}
                      >
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        t+{formatT(e.at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{e.title}</p>
                    {e.body && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.body}</p>
                    )}
                    {e.detail && (
                      <ul className="mt-2 space-y-1">
                        {e.detail.map((d) => (
                          <li
                            key={d.label}
                            className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="truncate text-foreground">{d.label}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${Math.round(d.value * 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="font-mono tabular-nums text-muted-foreground">
                              {(d.value * 100).toFixed(0)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {e.awaitsClinician && (
                      <ClinicianDecisionBlock id={e.id} choice={d} onDecision={onDecision} />
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>
      {learningSummary && (
        <div className="border-t border-border px-4 py-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Learning memory</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {learningSummary.total} case(s)
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {learningSummary.patterns.map((p, i) => (
              <li key={i}>· {p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ClinicianDecisionBlock({
  id,
  choice,
  onDecision,
}: {
  id: string;
  choice: ClinicianChoice | undefined;
  onDecision: (id: string, choice: ClinicianChoice) => void;
}) {
  const [reason, setReason] = useState("");
  const [modifiedTreatment, setModifiedTreatment] = useState("");
  const [modifying, setModifying] = useState(false);

  if (choice) {
    const label =
      choice.action === "accept"
        ? "Accepted"
        : choice.action === "modify"
          ? `Modified → ${choice.modifiedTreatment || "(unspecified)"}`
          : "Rejected";
    return (
      <div className="mt-3 text-xs text-muted-foreground">
        Clinician {label}
        {choice.reason ? ` · "${choice.reason}"` : ""} · logged
      </div>
    );
  }

  const submit = (action: ClinicianChoice["action"]) => {
    onDecision(id, {
      action,
      reason: reason.trim() || undefined,
      modifiedTreatment: action === "modify" ? modifiedTreatment.trim() || undefined : undefined,
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
      />
      {modifying && (
        <input
          value={modifiedTreatment}
          onChange={(e) => setModifiedTreatment(e.target.value)}
          placeholder="Modified treatment (required)"
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => submit("accept")}>
          Accept
        </Button>
        {modifying ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={!modifiedTreatment.trim()}
            onClick={() => submit("modify")}
          >
            Confirm modify
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setModifying(true)}>
            Modify
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => submit("reject")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
