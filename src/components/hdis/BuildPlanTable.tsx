type Row = { component: string; purpose: string; status: "done" | "active" | "planned" };

const rows: Row[] = [
  {
    component: "Synthetic Vitals Generator",
    purpose: "Realistic patient data stream to react to",
    status: "done",
  },
  {
    component: "Monitoring Agent",
    purpose: "Detects abnormal vitals trends (Shock Index + qSOFA)",
    status: "done",
  },
  {
    component: "Investigation Agent",
    purpose: "Hypothesises root cause using patient context",
    status: "done",
  },
  {
    component: "Digital Twin Simulator",
    purpose: "Simulates treatment outcomes (recovery / risk)",
    status: "done",
  },
  {
    component: "Recommendation Agent",
    purpose: "Ranks and selects best intervention",
    status: "done",
  },
  {
    component: "Safety Agent",
    purpose: "Checks allergies, interactions, renal dosing",
    status: "done",
  },
  {
    component: "Clinician Review",
    purpose: "Human-in-the-loop accept / modify / reject with reason",
    status: "done",
  },
  {
    component: "Learning Agent",
    purpose: "Logs outcomes + recurring patterns to local store",
    status: "done",
  },
  {
    component: "Live Demo Dashboard",
    purpose: "Real-time vitals + agent reasoning trace UI",
    status: "done",
  },
  {
    component: "Evaluation Harness",
    purpose: "Tests recommendation accuracy across synthetic patients",
    status: "planned",
  },
];

const chip: Record<Row["status"], { className: string; label: string }> = {
  done: { className: "bg-success/15 text-success-foreground border-success/30", label: "Done" },
  active: {
    className: "bg-warning/15 text-warning-foreground border-warning/30",
    label: "In progress",
  },
  planned: { className: "bg-secondary text-muted-foreground border-border", label: "Planned" },
};

export function BuildPlanTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Component</th>
            <th className="px-4 py-3 font-medium">Purpose</th>
            <th className="px-4 py-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.component} className="transition-colors hover:bg-secondary/40">
              <td className="px-4 py-3 font-medium text-foreground">{r.component}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.purpose}</td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${chip[r.status].className}`}
                >
                  {chip[r.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
