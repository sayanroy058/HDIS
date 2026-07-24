import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Cpu, FlaskConical, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ArchitectureFlow } from "@/components/hdis/ArchitectureFlow";
import { BuildPlanTable } from "@/components/hdis/BuildPlanTable";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HDIS — Healthcare Digital Immune System" },
      {
        name: "description",
        content:
          "A multi-agent clinical decision support prototype: autonomous ICU vitals monitoring, counterfactual digital-twin simulation, and human-in-the-loop recommendations.",
      },
      { property: "og:title", content: "HDIS — Healthcare Digital Immune System" },
      {
        property: "og:description",
        content:
          "Multi-agent clinical decision support prototype with digital-twin counterfactual simulation and human-in-the-loop safety.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <WhatThisIs />
        <Architecture />
        <Progress />
        <BuildPlan />
        <DesignDecisions />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Healthcare Digital Immune System
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
          A multi-agent clinical decision support <em className="text-primary not-italic">prototype</em>.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          HDIS monitors simulated ICU vitals, investigates likely causes, runs counterfactual treatments
          against a digital twin of the patient, and recommends the safest course — with a clinician
          always making the final call.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Foundation layer complete · Digital Twin in progress
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
          >
            View live demo <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Jump to architecture
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatThisIs() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionLabel>01 · What this is</SectionLabel>
          <h2 className="mt-3 font-display text-3xl leading-tight">
            Autonomous monitoring, counterfactual simulation, multi-agent reasoning — with a human in the loop.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              HDIS is a prototype multi-agent AI system that monitors simulated ICU patient vitals,
              investigates the likely cause of any concerning trend, simulates the outcome of different
              treatment options on a digital twin of the patient, and recommends the safest, most
              effective intervention.
            </p>
            <p>
              The goal is to demonstrate an architecture pattern relevant to next-generation clinical
              decision support. This is a portfolio / prototype build using synthetic data — not a
              clinical product.
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Three pillars
          </p>
          <ul className="mt-4 space-y-4">
            <Pillar icon={Stethoscope} title="Autonomous monitoring">
              An agent watches the vitals stream and surfaces abnormal trends without prompting.
            </Pillar>
            <Pillar icon={Cpu} title="Counterfactual simulation">
              A digital twin scores interventions with qSOFA + Shock Index — not LLM guesses.
            </Pillar>
            <Pillar icon={ShieldCheck} title="Human-in-the-loop safety">
              Recommendations pass a safety check then await a clinician's accept / reject.
            </Pillar>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function Pillar({ icon: Icon, title, children }: { icon: typeof Cpu; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}

function Architecture() {
  return (
    <section id="architecture" className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>02 · System architecture</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight">
        Eight stages from raw vitals to logged outcome.
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Each agent has a narrow remit and a defensible output. The Digital Twin's outcome predictions
        are anchored to established clinical scoring systems so the numbers stay explainable.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <ArchitectureFlow />
        <div className="hidden md:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Why this shape</p>
            <h3 className="mt-2 font-display text-xl leading-tight">
              Reasoning split across narrow agents, grounded in clinical scores.
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Each agent's output is auditable on its own.
              </li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                The twin's predictions are anchored to qSOFA + Shock Index, not LLM intuition.
              </li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Safety check + clinician sign-off precede any treatment.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Progress() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>03 · Progress so far</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight">
        Foundation built and validated. Digital twin next.
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-[11px] text-success-foreground">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Synthetic Vitals Generator</p>
          </div>
          <h3 className="mt-3 font-display text-xl leading-tight">
            A reproducible, clinically-plausible patient feed.
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><span className="text-foreground">Six tracked vitals:</span> HR, systolic BP, RR, SpO₂, temperature, mental status — the exact inputs to qSOFA and Shock Index.</li>
            <li><span className="text-foreground">Three patient modes:</span> Stable, Deteriorating (sigmoid sepsis arc), Recovering.</li>
            <li><span className="text-foreground">Reproducible:</span> seeded trajectories replay reliably for demos and tests.</li>
            <li><span className="text-foreground">Validated:</span> HR 78→130 bpm, SBP 118→78 mmHg, SpO₂ 97→85%, temp climbing to 39.5°C.</li>
          </ul>
          <div className="mt-5 rounded-lg border border-border bg-background/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Validated arc · HR (bpm)</div>
            <ArcSparkline />
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] text-warning-foreground">
              <FlaskConical className="h-3 w-3" /> In progress
            </span>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Digital Twin Simulator</p>
          </div>
          <h3 className="mt-3 font-display text-xl leading-tight">
            Defensible outcome predictions instead of LLM guesses.
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The twin uses real clinical scoring logic (qSOFA, Shock Index) plus a lightweight physiological
            response model to predict how the patient's vitals would trend under different interventions —
            antibiotics, fluids, oxygen support, ICU escalation — producing a defensible, explainable
            probability for each option.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Abx + fluids", v: 82 },
              { label: "Fluids only", v: 54 },
              { label: "O₂ only", v: 31 },
            ].map((o) => (
              <div key={o.label} className="rounded-lg border border-border bg-background/60 p-3">
                <p className="font-mono text-2xl tabular-nums text-foreground">{o.v}%</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{o.label}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function ArcSparkline() {
  // 50 points sigmoid 78 -> 130
  const pts = Array.from({ length: 50 }, (_, i) => {
    const p = 1 / (1 + Math.exp(-(i - 25) / 5));
    return 78 + (130 - 78) * p;
  });
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 320, h = 56;
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-14 w-full">
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.75} />
    </svg>
  );
}

function BuildPlan() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>04 · Build plan &amp; status</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight">
        Where every component sits today.
      </h2>
      <div className="mt-8">
        <BuildPlanTable />
      </div>
    </section>
  );
}

function DesignDecisions() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Synthetic data, not real patient data",
      body: "No PHI / HIPAA exposure. This is a prototype, not a path to production clinical deployment as-is.",
    },
    {
      icon: Cpu,
      title: "Clinically-grounded simulation, not LLM guesswork",
      body: "The Digital Twin anchors outcome predictions to qSOFA and Shock Index. LLM agents handle reasoning and orchestration on top.",
    },
    {
      icon: Sparkles,
      title: "Human-in-the-loop by design",
      body: "The system recommends; it never autonomously administers treatment. Every recommendation passes through a clinician decision point.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionLabel>05 · Notable design decisions</SectionLabel>
      <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight">
        Choices that shape the prototype's credibility.
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary-soft text-primary">
              <i.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-4 font-display text-lg leading-tight">{i.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{children}</p>
  );
}
