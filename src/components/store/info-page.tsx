export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="meta !text-mist">{eyebrow}</p>
        <h1 className="display-title mt-3 text-5xl sm:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-xl text-sm leading-6 text-mist">{intro}</p>}
        <div className="mt-10 space-y-8 border-t border-white/10 pt-10">{children}</div>
      </div>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 sm:grid-cols-[180px_1fr] sm:gap-8">
      <h2 className="meta !text-paper">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-mist">{children}</div>
    </section>
  );
}
