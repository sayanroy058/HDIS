import type { Patient } from "./patient";
import type { VitalsSample } from "./types";

// ---------- Shared types ----------

export type MonitorStatus = "normal" | "warning" | "critical";

export type MonitorReport = {
  status: MonitorStatus;
  scores: { shockIndex: number; qsofa: number };
  alerts: string[];
  evidence: string[];
  trends: { vital: string; from: number; to: number; delta: number }[];
  latest: VitalsSample;
};

export type Hypothesis = {
  name: string;
  confidence: number; // 0..1 normalized
  evidence: string[];
  testsRecommended: string[];
};

export type InvestigationReport = {
  hypotheses: Hypothesis[];
  top: Hypothesis;
};

export type Treatment = {
  name: string;
  ingredients: string[]; // used by Safety Agent
  class: string;
};

export type Simulation = {
  treatment: Treatment;
  recoveryProb: number; // 0..1
  riskScore: number; // 0..1
  predictedDeltaHours: { hr: number; sbp: number; spo2: number };
  rationale: string;
};

export type TwinReport = { simulations: Simulation[] };

export type Recommendation = {
  ranked: (Simulation & { utility: number })[];
  top: Simulation & { utility: number };
};

export type SafetyCheck = {
  name: string;
  passed: boolean;
  note?: string;
};

export type SafetyReport = {
  status: "approved" | "modified" | "blocked";
  checks: SafetyCheck[];
  approvedTreatment: Treatment | null;
  substitutedFrom?: Treatment;
  notes: string[];
};

export type ClinicianDecision = {
  action: "accept" | "reject" | "modify";
  reason?: string;
  modifiedTreatment?: string; // free-text override when action === "modify"
  at: number; // elapsed seconds
};

export type LearningRecord = {
  patientId: string;
  topHypothesis: string;
  recommendedTreatment: string;
  appliedTreatment: string; // what the clinician actually did (modified / approved / none)
  safetyStatus: SafetyReport["status"];
  clinician: ClinicianDecision;
  monitorScores: MonitorReport["scores"];
  loggedAt: number;
};

// ---------- Monitoring Agent ----------

function mean(vals: number[]) {
  return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
}

export function runMonitoring(samples: VitalsSample[]): MonitorReport | null {
  if (samples.length < 6) return null;
  const latest = samples[samples.length - 1];
  const recent = samples.slice(-10);
  const early = samples.slice(-30, -20);

  const avgRecent = {
    hr: mean(recent.map((s) => s.hr)),
    sbp: mean(recent.map((s) => s.sbp)),
    rr: mean(recent.map((s) => s.rr)),
    spo2: mean(recent.map((s) => s.spo2)),
    temp: mean(recent.map((s) => s.temp)),
  };
  const avgEarly = early.length
    ? {
        hr: mean(early.map((s) => s.hr)),
        sbp: mean(early.map((s) => s.sbp)),
        spo2: mean(early.map((s) => s.spo2)),
      }
    : { hr: avgRecent.hr, sbp: avgRecent.sbp, spo2: avgRecent.spo2 };

  const shockIndex = avgRecent.hr / Math.max(1, avgRecent.sbp);
  let qsofa = 0;
  if (avgRecent.rr >= 22) qsofa += 1;
  if (avgRecent.sbp <= 100) qsofa += 1;
  if (latest.mental >= 1) qsofa += 1;

  const alerts: string[] = [];
  const evidence: string[] = [];

  if (avgRecent.spo2 < 92) alerts.push(`SpO₂ ${avgRecent.spo2.toFixed(0)}% below 92`);
  if (avgRecent.hr > 110) alerts.push(`Tachycardia ${avgRecent.hr.toFixed(0)} bpm`);
  if (avgRecent.sbp < 100) alerts.push(`Hypotension ${avgRecent.sbp.toFixed(0)} mmHg`);
  if (avgRecent.temp >= 38) alerts.push(`Fever ${avgRecent.temp.toFixed(1)} °C`);
  if (avgRecent.rr >= 22) alerts.push(`Tachypnea ${avgRecent.rr.toFixed(0)} /min`);

  if (shockIndex >= 0.9) evidence.push(`Shock Index ${shockIndex.toFixed(2)} (≥0.9 concerning)`);
  if (qsofa >= 1) evidence.push(`qSOFA ${qsofa} of 3`);

  const trends = [
    { vital: "HR", from: avgEarly.hr, to: avgRecent.hr, delta: avgRecent.hr - avgEarly.hr },
    { vital: "SBP", from: avgEarly.sbp, to: avgRecent.sbp, delta: avgRecent.sbp - avgEarly.sbp },
    {
      vital: "SpO₂",
      from: avgEarly.spo2,
      to: avgRecent.spo2,
      delta: avgRecent.spo2 - avgEarly.spo2,
    },
  ].filter((t) => Math.abs(t.delta) >= 3);

  let status: MonitorStatus = "normal";
  if (qsofa >= 2 || shockIndex > 1.0 || avgRecent.spo2 < 90) status = "critical";
  else if (alerts.length > 0 || shockIndex >= 0.9) status = "warning";

  return {
    status,
    scores: { shockIndex: +shockIndex.toFixed(2), qsofa },
    alerts,
    evidence,
    trends,
    latest,
  };
}

// ---------- Investigation Agent ----------

export function runInvestigation(monitor: MonitorReport, patient: Patient): InvestigationReport {
  const v = monitor.latest;
  const { qsofa, shockIndex } = monitor.scores;

  const raw: Hypothesis[] = [
    {
      name: "Sepsis",
      confidence:
        0.2 +
        (qsofa >= 2 ? 0.3 : qsofa === 1 ? 0.12 : 0) +
        (v.temp >= 38 ? 0.2 : 0) +
        (patient.riskFactors.indwellingCatheter ? 0.12 : 0) +
        (patient.riskFactors.postOp ? 0.08 : 0),
      evidence: [
        qsofa >= 1 ? `qSOFA ${qsofa}` : "",
        v.temp >= 38 ? `Fever ${v.temp.toFixed(1)}°C` : "",
        patient.riskFactors.indwellingCatheter ? "Indwelling catheter (infection source)" : "",
        patient.riskFactors.postOp ? "Post-op infection risk" : "",
      ].filter(Boolean),
      testsRecommended: ["Blood cultures ×2", "Serum lactate", "CBC + CRP", "Urinalysis"],
    },
    {
      name: "Hypovolemia",
      confidence:
        0.15 + (shockIndex >= 0.9 ? 0.2 : 0) + (v.temp < 38 ? 0.05 : 0) + (v.sbp < 100 ? 0.1 : 0),
      evidence: [
        shockIndex >= 0.9 ? `Shock Index ${shockIndex}` : "",
        v.sbp < 100 ? `SBP ${v.sbp.toFixed(0)} mmHg` : "",
      ].filter(Boolean),
      testsRecommended: ["Point-of-care ultrasound (IVC)", "Hemoglobin", "Fluid balance review"],
    },
    {
      name: "Pulmonary embolism",
      confidence:
        0.05 +
        (v.spo2 < 92 && v.hr > 110 && v.temp < 38 ? 0.2 : 0) +
        (patient.riskFactors.peRisk ? 0.15 : 0),
      evidence: [
        v.spo2 < 92 ? `SpO₂ ${v.spo2.toFixed(0)}%` : "",
        v.hr > 110 ? `HR ${v.hr.toFixed(0)} bpm` : "",
      ].filter(Boolean),
      testsRecommended: ["CT pulmonary angiogram", "D-dimer"],
    },
    {
      name: "Cardiogenic shock",
      confidence: 0.05 + (v.sbp < 90 && v.hr > 100 ? 0.15 : 0),
      evidence: [v.sbp < 90 ? `SBP ${v.sbp.toFixed(0)}` : ""].filter(Boolean),
      testsRecommended: ["12-lead ECG", "Troponin", "Bedside echo"],
    },
  ];

  // Normalize.
  const total = raw.reduce((a, h) => a + h.confidence, 0);
  const hypotheses = raw
    .map((h) => ({ ...h, confidence: +(h.confidence / total).toFixed(2) }))
    .sort((a, b) => b.confidence - a.confidence);

  return { hypotheses, top: hypotheses[0] };
}

// ---------- Digital Twin ----------

const treatmentCatalog: Record<string, Treatment[]> = {
  Sepsis: [
    {
      name: "Broad-spectrum abx + 30 mL/kg fluids + O₂",
      ingredients: ["piperacillin-tazobactam", "crystalloid", "oxygen"],
      class: "antibiotic+fluid",
    },
    { name: "Fluid resuscitation only", ingredients: ["crystalloid"], class: "fluid" },
    { name: "Oxygen support only", ingredients: ["oxygen"], class: "supportive" },
    {
      name: "ICU escalation + vasopressors",
      ingredients: ["norepinephrine", "crystalloid"],
      class: "vasopressor",
    },
  ],
  Hypovolemia: [
    { name: "Crystalloid 30 mL/kg bolus", ingredients: ["crystalloid"], class: "fluid" },
    { name: "Blood products (PRBC)", ingredients: ["packed red cells"], class: "transfusion" },
    { name: "Vasopressor bridge", ingredients: ["norepinephrine"], class: "vasopressor" },
  ],
  "Pulmonary embolism": [
    { name: "Therapeutic anticoagulation", ingredients: ["heparin"], class: "anticoagulant" },
    { name: "Systemic thrombolysis", ingredients: ["alteplase"], class: "thrombolytic" },
    { name: "Supplemental O₂ + monitoring", ingredients: ["oxygen"], class: "supportive" },
  ],
  "Cardiogenic shock": [
    { name: "Inotropic support (dobutamine)", ingredients: ["dobutamine"], class: "inotrope" },
    {
      name: "Cautious fluid + vasopressor",
      ingredients: ["crystalloid", "norepinephrine"],
      class: "mixed",
    },
  ],
};

// Baseline efficacy priors per class (0..1) for how well it addresses the top hypothesis.
const efficacyPrior: Record<string, number> = {
  "antibiotic+fluid": 0.9,
  fluid: 0.55,
  supportive: 0.32,
  vasopressor: 0.7,
  transfusion: 0.65,
  anticoagulant: 0.75,
  thrombolytic: 0.85,
  inotrope: 0.7,
  mixed: 0.6,
};

// Class-level risk priors (0..1).
const riskPrior: Record<string, number> = {
  "antibiotic+fluid": 0.18,
  fluid: 0.1,
  supportive: 0.05,
  vasopressor: 0.35,
  transfusion: 0.22,
  anticoagulant: 0.28,
  thrombolytic: 0.55,
  inotrope: 0.35,
  mixed: 0.3,
};

export function runDigitalTwin(
  investigation: InvestigationReport,
  monitor: MonitorReport,
): TwinReport {
  const options = treatmentCatalog[investigation.top.name] ?? treatmentCatalog.Sepsis;
  const severity = Math.min(
    1,
    0.4 + monitor.scores.qsofa * 0.2 + Math.max(0, monitor.scores.shockIndex - 0.8),
  );

  const simulations: Simulation[] = options.map((t) => {
    const eff = efficacyPrior[t.class] ?? 0.5;
    // Recovery = efficacy × hypothesis confidence, damped by severity.
    const recoveryProb = +(
      eff *
      (0.5 + investigation.top.confidence / 2) *
      (1.05 - severity * 0.3)
    ).toFixed(2);
    const riskScore = +(riskPrior[t.class] ?? 0.2).toFixed(2);
    // Naive predicted 4-hour vital deltas.
    const predictedDeltaHours = {
      hr: -Math.round(eff * 20 * severity),
      sbp: Math.round(eff * 22 * severity),
      spo2: Math.round(eff * 8 * (1 - monitor.latest.spo2 / 100)),
    };
    return {
      treatment: t,
      recoveryProb: Math.min(0.98, Math.max(0.05, recoveryProb)),
      riskScore,
      predictedDeltaHours,
      rationale: `${t.class} priors × ${(investigation.top.confidence * 100).toFixed(0)}% ${investigation.top.name} confidence, severity ${severity.toFixed(2)}`,
    };
  });

  return { simulations };
}

// ---------- Recommendation Agent ----------

export function runRecommendation(twin: TwinReport): Recommendation {
  const ranked = twin.simulations
    .map((s) => ({ ...s, utility: +(s.recoveryProb - 0.35 * s.riskScore).toFixed(3) }))
    .sort((a, b) => b.utility - a.utility);
  return { ranked, top: ranked[0] };
}

// ---------- Safety Agent ----------

const allergyMap: Record<string, string[]> = {
  penicillin: ["piperacillin-tazobactam", "amoxicillin", "ampicillin"],
};

const interactionMap: Array<{ a: string; b: string; note: string }> = [
  { a: "enoxaparin", b: "heparin", note: "Duplicate anticoagulation — bleeding risk" },
  {
    a: "enoxaparin",
    b: "alteplase",
    note: "Increased major bleeding risk with thrombolytic on anticoagulant",
  },
];

// Ingredients that require renal dose adjustment when eGFR is low.
const renalAdjustIngredients = [
  "piperacillin-tazobactam",
  "metformin",
  "enoxaparin",
  "norepinephrine",
  "dobutamine",
];

function conflicts(ingredient: string, patient: Patient) {
  const meds = patient.medications.map((m) => m.toLowerCase());
  const allergies = patient.allergies.map((a) => a.toLowerCase());
  const hits: string[] = [];

  for (const a of allergies) {
    for (const key of Object.keys(allergyMap)) {
      if (a.includes(key) && allergyMap[key].some((x) => ingredient.toLowerCase().includes(x))) {
        hits.push(`Allergy conflict: ${key} → ${ingredient}`);
      }
    }
  }
  for (const inter of interactionMap) {
    if (
      (ingredient.toLowerCase().includes(inter.a) && meds.some((m) => m.includes(inter.b))) ||
      (ingredient.toLowerCase().includes(inter.b) && meds.some((m) => m.includes(inter.a)))
    ) {
      hits.push(inter.note);
    }
  }
  return hits;
}

export function runSafety(rec: Recommendation, patient: Patient): SafetyReport {
  const notes: string[] = [];
  const checks: SafetyCheck[] = [];

  const evaluate = (sim: Recommendation["top"]) => {
    const hits: string[] = [];
    for (const ing of sim.treatment.ingredients) hits.push(...conflicts(ing, patient));
    return hits;
  };

  const primaryHits = evaluate(rec.top);
  checks.push({
    name: "Allergy screen",
    passed: !primaryHits.some((h) => h.startsWith("Allergy")),
    note: primaryHits.find((h) => h.startsWith("Allergy")),
  });
  checks.push({
    name: "Drug-drug interactions",
    passed: !primaryHits.some((h) => !h.startsWith("Allergy")),
    note: primaryHits.find((h) => !h.startsWith("Allergy")),
  });

  // Renal dose adjustment: check whether any ingredient needs reduction at the
  // patient's mock eGFR. <30 severe, 30–59 moderate, ≥60 no adjustment.
  const renalFlags = rec.top.treatment.ingredients.filter((ing) =>
    renalAdjustIngredients.some((r) => ing.toLowerCase().includes(r)),
  );
  let renalPassed = true;
  let renalNote = `No dose reduction required at eGFR ${patient.egfr}`;
  if (renalFlags.length > 0 && patient.egfr < 60) {
    renalPassed = false;
    renalNote = `Dose adjustment required for ${renalFlags.join(", ")} (eGFR ${patient.egfr} < 60)`;
  }
  checks.push({ name: "Renal dose adjustment", passed: renalPassed, note: renalNote });

  if (primaryHits.length === 0) {
    if (!renalPassed) {
      notes.push(`Renal dose adjustment applied: ${renalNote}`);
      return {
        status: "modified",
        checks,
        approvedTreatment: rec.top.treatment,
        notes,
      };
    }
    return { status: "approved", checks, approvedTreatment: rec.top.treatment, notes };
  }

  // Try substituting to next-best safe option.
  const substitute = rec.ranked.slice(1).find((s) => evaluate(s).length === 0);
  if (substitute) {
    notes.push(`Substituted from "${rec.top.treatment.name}" due to: ${primaryHits.join("; ")}`);
    if (!renalPassed) notes.push(`Renal note retained: ${renalNote}`);
    return {
      status: "modified",
      checks,
      approvedTreatment: substitute.treatment,
      substitutedFrom: rec.top.treatment,
      notes,
    };
  }

  notes.push(`Blocked: ${primaryHits.join("; ")}`);
  return { status: "blocked", checks, approvedTreatment: null, notes };
}

// ---------- Learning Agent ----------

export function runLearning(
  patient: Patient,
  monitor: MonitorReport,
  investigation: InvestigationReport,
  safety: SafetyReport,
  clinician: ClinicianDecision,
): LearningRecord {
  let appliedTreatment: string;
  if (clinician.action === "accept") {
    appliedTreatment = safety.approvedTreatment?.name ?? "none";
  } else if (clinician.action === "modify") {
    appliedTreatment =
      clinician.modifiedTreatment?.trim() ||
      safety.approvedTreatment?.name ||
      "modified (unspecified)";
  } else {
    appliedTreatment = "none (rejected)";
  }
  return {
    patientId: patient.id,
    topHypothesis: investigation.top.name,
    recommendedTreatment: safety.approvedTreatment?.name ?? "none",
    appliedTreatment,
    safetyStatus: safety.status,
    clinician,
    monitorScores: monitor.scores,
    loggedAt: clinician.at,
  };
}

// ---------- Learning persistence (mock localStorage store) ----------

const LEARNING_KEY = "hdis.learningLog.v1";

export function loadLearningLog(): LearningRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEARNING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearningRecord[]) : [];
  } catch {
    return [];
  }
}

export function persistLearningRecord(record: LearningRecord): LearningRecord[] {
  const log = loadLearningLog();
  log.push(record);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(log));
    }
  } catch {
    // storage unavailable — keep in-memory copy only
  }
  return log;
}

export function clearLearningLog(): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(LEARNING_KEY);
  } catch {
    // ignore
  }
}

export type LearningSummary = {
  total: number;
  acceptRate: number;
  rejectRate: number;
  modifyRate: number;
  topHypothesisCounts: Record<string, number>;
  topTreatmentCounts: Record<string, number>;
  patterns: string[];
};

export function summarizeLearning(log: LearningRecord[]): LearningSummary {
  const total = log.length;
  const accept = log.filter((r) => r.clinician.action === "accept").length;
  const reject = log.filter((r) => r.clinician.action === "reject").length;
  const modify = log.filter((r) => r.clinician.action === "modify").length;

  const topHypothesisCounts: Record<string, number> = {};
  const topTreatmentCounts: Record<string, number> = {};
  for (const r of log) {
    topHypothesisCounts[r.topHypothesis] = (topHypothesisCounts[r.topHypothesis] ?? 0) + 1;
    topTreatmentCounts[r.appliedTreatment] = (topTreatmentCounts[r.appliedTreatment] ?? 0) + 1;
  }

  const patterns: string[] = [];
  if (total === 0) {
    patterns.push("No cases logged yet.");
  } else {
    const topHyp = Object.entries(topHypothesisCounts).sort((a, b) => b[1] - a[1])[0];
    if (topHyp)
      patterns.push(`Most frequent hypothesis: ${topHyp[0]} (${topHyp[1]}/${total} cases).`);
    const topTx = Object.entries(topTreatmentCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTx) patterns.push(`Most applied treatment: ${topTx[0]} (${topTx[1]}/${total} cases).`);
    patterns.push(`Clinician acceptance rate: ${total ? Math.round((accept / total) * 100) : 0}%.`);
    if (modify > 0)
      patterns.push(`${modify} case(s) modified by clinician — review for recommendation gaps.`);
    if (reject > 0) patterns.push(`${reject} case(s) rejected — flagged for retrospective review.`);
    const blocked = log.filter((r) => r.safetyStatus === "blocked").length;
    if (blocked > 0) patterns.push(`${blocked} case(s) blocked by safety agent upstream.`);
  }

  return {
    total,
    acceptRate: total ? accept / total : 0,
    rejectRate: total ? reject / total : 0,
    modifyRate: total ? modify / total : 0,
    topHypothesisCounts,
    topTreatmentCounts,
    patterns,
  };
}
