// Dummy clinical data for the HDIS front-end prototype. No backend.

export type Trend = "up" | "down" | "flat";

export type Vital = {
  key: string;
  label: string;
  unit: string;
  value: string;
  range: string;
  status: "critical" | "warning" | "normal";
  series: number[];
};

export const patient = {
  name: "Rajesh Sharma",
  age: 62,
  sex: "Male",
  bed: "ICU - Bed 07",
  mrn: "HD-ICU-2025-00047",
  admitted: "Day 3",
};

export const clinician = {
  name: "Dr. Arjun Mehta",
  role: "Attending Physician",
  alerts: 3,
};

export const riskBanner = {
  title: "HIGH DETERIORATION RISK",
  detectedAt: "09:23 AM",
  ago: "15 min ago",
  series: [12, 18, 14, 26, 22, 34, 30, 44, 40, 58, 52, 70, 66, 82],
};

export const scores = [
  { label: "Shock Index", value: "1.32", sub: "High" },
  { label: "qSOFA", value: "2 / 3", sub: "High" },
  { label: "MEWS", value: "6", sub: "High" },
];

export const vitals: Vital[] = [
  {
    key: "hr",
    label: "HR",
    unit: "bpm",
    value: "124",
    range: "60 – 100",
    status: "critical",
    series: [98, 102, 100, 106, 109, 114, 111, 118, 121, 124],
  },
  {
    key: "map",
    label: "MAP",
    unit: "mmHg",
    value: "62",
    range: "65 – 100",
    status: "critical",
    series: [78, 76, 74, 75, 71, 69, 70, 66, 64, 62],
  },
  {
    key: "rr",
    label: "RR",
    unit: "/min",
    value: "28",
    range: "12 – 20",
    status: "warning",
    series: [20, 21, 22, 21, 23, 25, 24, 26, 27, 28],
  },
  {
    key: "spo2",
    label: "SpO₂",
    unit: "%",
    value: "91",
    range: "95 – 100",
    status: "warning",
    series: [97, 96, 96, 95, 94, 94, 93, 92, 92, 91],
  },
  {
    key: "temp",
    label: "Temp",
    unit: "°C",
    value: "38.7",
    range: "36.0 – 37.5",
    status: "critical",
    series: [37.1, 37.3, 37.4, 37.5, 37.8, 38.0, 38.2, 38.4, 38.6, 38.7],
  },
  {
    key: "lactate",
    label: "Lactate",
    unit: "mmol/L",
    value: "4.2",
    range: "0.5 – 2.0",
    status: "warning",
    series: [1.6, 1.8, 2.1, 2.3, 2.8, 3.0, 3.4, 3.7, 4.0, 4.2],
  },
  {
    key: "creatinine",
    label: "Creatinine",
    unit: "mg/dL",
    value: "1.8",
    range: "0.6 – 1.2",
    status: "normal",
    series: [1.0, 1.1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8],
  },
  {
    key: "urine",
    label: "Urine Output",
    unit: "mL/hr",
    value: "25",
    range: "> 0.5 mL/kg/hr",
    status: "warning",
    series: [58, 55, 50, 46, 42, 38, 34, 30, 27, 25],
  },
];

export const whyNow: { icon: string; text: string; trend: Trend }[] = [
  { icon: "map", text: "MAP decreased 76 → 62 mmHg", trend: "down" },
  { icon: "hr", text: "HR increased 102 → 124 bpm", trend: "up" },
  { icon: "lactate", text: "Lactate increased 2.1 → 4.2 mmol/L", trend: "up" },
  { icon: "urine", text: "Urine output decreased 0.8 → 0.3 mL/kg/hr", trend: "down" },
  { icon: "temp", text: "Temperature increased 37.5 → 38.7 °C", trend: "up" },
];

export const diagnoses = [
  { name: "Sepsis / Septic Shock", pct: 61 },
  { name: "Hypovolemia", pct: 23 },
  { name: "Pulmonary Embolism", pct: 8 },
  { name: "Cardiogenic Shock", pct: 5 },
  { name: "Tension Pneumothorax", pct: 3 },
];

export const evidence = {
  supporting: [
    "Fever (38.7 °C)",
    "Tachycardia (HR 124 bpm)",
    "Tachypnea (RR 28 /min)",
    "Hypotension (MAP 62 mmHg)",
    "Elevated Lactate (4.2 mmol/L)",
    "Possible source: Central line (Day 3)",
  ],
  against: [
    "No JVD or pulmonary oedema on exam",
    "ECG without ischaemic changes",
    "Bilateral breath sounds present",
    "No recent immobilisation or DVT signs",
  ],
};

export const missingInfo = [
  { name: "Blood Cultures", priority: "High" },
  { name: "CBC with Differential", priority: "High" },
  { name: "Arterial Blood Gas", priority: "Medium" },
  { name: "Bedside Ultrasound (IVC, Lung)", priority: "Medium" },
  { name: "Urine Analysis", priority: "Low" },
] as const;

export const simulations = [
  {
    title: "Antibiotics",
    subtitle: "+ Fluids + Oxygen + Vasopressor",
    pct: 82,
    recommended: true,
    series: [20, 28, 34, 45, 52, 63, 70, 76, 82],
  },
  {
    title: "Fluids",
    subtitle: "+ Oxygen",
    pct: 61,
    recommended: false,
    series: [18, 24, 30, 36, 42, 48, 53, 58, 61],
  },
  {
    title: "Fluids Only",
    subtitle: "No antimicrobial cover",
    pct: 42,
    recommended: false,
    series: [16, 20, 24, 26, 30, 33, 37, 40, 42],
  },
  {
    title: "Oxygen Support Only",
    subtitle: "Supportive care",
    pct: 28,
    recommended: false,
    series: [14, 16, 18, 19, 21, 23, 24, 26, 28],
  },
];

export const timeline = [
  { time: "10:05", label: "Lactate", detail: "declining", tone: "good" },
  { time: "09:45", label: "MAP", detail: "improving", tone: "good" },
  { time: "09:32", label: "Fluids", detail: "started", tone: "info" },
  { time: "09:27", label: "Blood cultures", detail: "ordered", tone: "info" },
  {
    time: "09:23",
    label: "HDIS Alert",
    detail: "Deterioration Detected",
    tone: "alert",
  },
  { time: "09:19", label: "Lactate", detail: "2.8 mmol/L", tone: "warn" },
  { time: "09:16", label: "Shock Index", detail: "abnormal (1.1)", tone: "warn" },
  { time: "09:10", label: "BP begins declining", detail: "", tone: "warn" },
] as const;

export const safetyChecks = [
  { label: "Dose within safe range", ok: true, result: "Passed" },
  { label: "Allergy check", ok: true, result: "Passed" },
  { label: "Drug interaction", ok: false, result: "Considered" },
  { label: "Renal adjustment", ok: true, result: "Applied" },
  { label: "Guideline concordance", ok: true, result: "Passed" },
  { label: "Contraindications", ok: true, result: "Passed" },
];

export const recommendation = {
  headline: "High likelihood of Sepsis / Septic Shock",
  actions: [
    "Start broad spectrum antibiotics within 60 min",
    "30 mL/kg crystalloid fluid bolus",
    "Monitor lactate & MAP every 30 min",
    "Consider vasopressor if MAP < 65 mmHg",
  ],
  confidence: 72,
};

export const alerts = [
  {
    time: "09:23 AM",
    severity: "Critical",
    title: "Deterioration risk crossed HIGH threshold",
    detail: "Composite score 0.82 · driven by MAP, lactate, HR",
  },
  {
    time: "09:16 AM",
    severity: "Warning",
    title: "Shock index abnormal (1.10)",
    detail: "HR/SBP ratio trending upward over 40 min",
  },
  {
    time: "08:54 AM",
    severity: "Info",
    title: "Urine output below target",
    detail: "0.4 mL/kg/hr over last 2 hours",
  },
];

export const wards = [
  { unit: "ICU", beds: 18, occupied: 16, highRisk: 3 },
  { unit: "HDU", beds: 12, occupied: 9, highRisk: 1 },
  { unit: "Emergency", beds: 24, occupied: 21, highRisk: 4 },
];

export const watchlist = [
  { name: "Rajesh Sharma", bed: "ICU-07", risk: "High", score: 0.82 },
  { name: "Meera Iyer", bed: "ICU-03", risk: "High", score: 0.74 },
  { name: "Kabir Singh", bed: "HDU-02", risk: "Moderate", score: 0.51 },
  { name: "Anita Rao", bed: "ICU-11", risk: "Moderate", score: 0.44 },
  { name: "Devansh Patel", bed: "ER-14", risk: "Low", score: 0.21 },
];
