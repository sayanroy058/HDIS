import type { Scenario, VitalKey, VitalStatus, VitalsSample } from "./types";

// Seeded PRNG (mulberry32) for reproducible noise.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

// Smooth progression 0 -> 1 from t=20s to t=110s (crisis window).
function progress(t: number) {
  return sigmoid((t - 65) / 12);
}

function lerp(a: number, b: number, p: number) {
  return a + (b - a) * p;
}

const baselines = {
  hr: 78,
  sbp: 118,
  rr: 16,
  spo2: 97,
  temp: 37.0,
  mental: 0,
};

const septicEnd = {
  hr: 130,
  sbp: 78,
  rr: 28,
  spo2: 85,
  temp: 39.5,
  mental: 1,
};

export function sampleAt(scenario: Scenario, t: number, seed = 7): VitalsSample {
  const rand = mulberry32(seed + Math.floor(t * 7));
  const n = (amp: number) => (rand() - 0.5) * 2 * amp;

  if (scenario === "stable") {
    return {
      t,
      hr: baselines.hr + n(2),
      sbp: baselines.sbp + n(3),
      rr: baselines.rr + n(1),
      spo2: Math.min(99, baselines.spo2 + n(0.6)),
      temp: +(baselines.temp + n(0.15)).toFixed(1),
      mental: 0,
    };
  }

  if (scenario === "sepsis") {
    const p = progress(t);
    return {
      t,
      hr: lerp(baselines.hr, septicEnd.hr, p) + n(2.5),
      sbp: lerp(baselines.sbp, septicEnd.sbp, p) + n(2.5),
      rr: lerp(baselines.rr, septicEnd.rr, p) + n(1),
      spo2: lerp(baselines.spo2, septicEnd.spo2, p) + n(0.6),
      temp: +(lerp(baselines.temp, septicEnd.temp, p) + n(0.1)).toFixed(1),
      mental: p > 0.7 ? 1 : 0,
    };
  }

  // recovering: start near crisis, ease back to baseline
  const p = 1 - progress(t);
  return {
    t,
    hr: lerp(baselines.hr, septicEnd.hr, p) + n(2),
    sbp: lerp(baselines.sbp, septicEnd.sbp, p) + n(2),
    rr: lerp(baselines.rr, septicEnd.rr, p) + n(0.8),
    spo2: lerp(baselines.spo2, septicEnd.spo2, p) + n(0.5),
    temp: +(lerp(baselines.temp, septicEnd.temp, p) + n(0.1)).toFixed(1),
    mental: p > 0.7 ? 1 : 0,
  };
}

export const vitalMeta: Record<
  VitalKey,
  { label: string; unit: string; range: string; format: (v: number) => string; status: (v: number) => VitalStatus }
> = {
  hr: {
    label: "Heart rate",
    unit: "bpm",
    range: "60–100",
    format: (v) => Math.round(v).toString(),
    status: (v) => (v > 120 || v < 50 ? "crit" : v > 100 || v < 60 ? "warn" : "ok"),
  },
  sbp: {
    label: "Systolic BP",
    unit: "mmHg",
    range: "100–140",
    format: (v) => Math.round(v).toString(),
    status: (v) => (v < 90 ? "crit" : v < 100 || v > 150 ? "warn" : "ok"),
  },
  rr: {
    label: "Resp. rate",
    unit: "/min",
    range: "12–20",
    format: (v) => Math.round(v).toString(),
    status: (v) => (v >= 24 ? "crit" : v >= 22 || v < 10 ? "warn" : "ok"),
  },
  spo2: {
    label: "SpO₂",
    unit: "%",
    range: "≥ 95",
    format: (v) => Math.round(v).toString(),
    status: (v) => (v < 90 ? "crit" : v < 95 ? "warn" : "ok"),
  },
  temp: {
    label: "Temperature",
    unit: "°C",
    range: "36.5–37.5",
    format: (v) => v.toFixed(1),
    status: (v) => (v >= 39 || v < 35 ? "crit" : v >= 38 || v < 36 ? "warn" : "ok"),
  },
  mental: {
    label: "Mental status",
    unit: "AVPU",
    range: "Alert",
    format: (v) => ["Alert", "Voice", "Pain", "Unresp."][Math.round(v)] ?? "Alert",
    status: (v) => (v >= 2 ? "crit" : v >= 1 ? "warn" : "ok"),
  },
};