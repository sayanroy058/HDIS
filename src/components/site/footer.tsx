export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Generated June 21, 2026 · Prototype/portfolio project using synthetic data only · Not a clinical product.</p>
        <p className="font-mono">HDIS · v0.1</p>
      </div>
    </footer>
  );
}