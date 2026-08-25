import { useEffect, useState } from "react";
import { riskBanner, scores, vitals } from "@/lib/hdis-data";
import type { Vital } from "@/lib/hdis-data";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function nextVital(vital: Vital): Vital {
  const current = Number.parseFloat(vital.value);
  const step = vital.key === "hr" ? 3 : vital.key === "map" ? 2 : vital.key === "spo2" ? 1 : 0.15;
  const next = clamp(current + (Math.random() - 0.48) * step * 2, vital.key === "spo2" ? 86 : 0, vital.key === "hr" ? 150 : 999);
  return { ...vital, value: vital.key === "hr" || vital.key === "map" || vital.key === "spo2" ? String(Math.round(next)) : next.toFixed(1), series: [...vital.series.slice(-14), next] };
}

export function useSimulatedVitals() {
  const [liveVitals, setLiveVitals] = useState(vitals);
  useEffect(() => { const timer = window.setInterval(() => setLiveVitals((current) => current.map(nextVital)), 2200); return () => window.clearInterval(timer); }, []);
  return liveVitals;
}

export function useSimulatedRisk() {
  const [risk, setRisk] = useState(riskBanner);
  const [liveScores, setLiveScores] = useState(scores);
  useEffect(() => { const timer = window.setInterval(() => { setRisk((current) => ({ ...current, series: [...current.series.slice(-18), clamp(current.series.at(-1)! + (Math.random() - 0.42) * 8, 30, 100)] })); setLiveScores((current) => current.map((score) => score.label === "Shock Index" ? { ...score, value: (1.25 + Math.random() * 0.14).toFixed(2) } : score.label === "MEWS" ? { ...score, value: String(Math.random() > 0.72 ? 7 : 6) } : score)); }, 3200); return () => window.clearInterval(timer); }, []);
  return { risk, scores: liveScores };
}
