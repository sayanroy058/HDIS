import type { TraceEvent } from "./types";

export const agentMeta: Record<
  TraceEvent["agent"],
  { label: string; tone: "neutral" | "warn" | "primary" | "success" }
> = {
  monitor: { label: "Monitoring", tone: "warn" },
  investigate: { label: "Investigation", tone: "neutral" },
  twin: { label: "Digital Twin", tone: "primary" },
  recommend: { label: "Recommendation", tone: "primary" },
  safety: { label: "Safety", tone: "success" },
  clinician: { label: "Clinician Review", tone: "warn" },
  learn: { label: "Learning", tone: "neutral" },
};
