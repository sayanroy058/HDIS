export type Scenario = "stable" | "sepsis" | "recovering";

export type VitalKey = "hr" | "sbp" | "rr" | "spo2" | "temp" | "mental";

export type VitalsSample = {
  t: number; // seconds since start
  hr: number;
  sbp: number;
  rr: number;
  spo2: number;
  temp: number;
  mental: number; // 0 alert, 1 voice, 2 pain, 3 unresponsive (AVPU)
};

export type VitalStatus = "ok" | "warn" | "crit";

export type AgentKind =
  "monitor" | "investigate" | "twin" | "recommend" | "safety" | "clinician" | "learn";

export type TraceEvent = {
  id: string;
  at: number; // seconds since start
  agent: AgentKind;
  title: string;
  body?: string;
  detail?: { label: string; value: number }[];
  awaitsClinician?: boolean;
};

export type ClinicianChoice = {
  action: "accept" | "reject" | "modify";
  reason?: string;
  modifiedTreatment?: string;
};
