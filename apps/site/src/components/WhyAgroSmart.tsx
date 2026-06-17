const reasons = [
  'Built around the timing pressure of farm decisions, not abstract productivity rituals',
  'Designed for mobile-first use, with a visual system that still scales cleanly on desktop',
  'Useful when weather, crop tracking, and diagnosis need to work together instead of living apart',
];

const evidence = [
  { label: 'Best for', value: 'Farmers who need quicker decisions in the field' },
  { label: 'Primary benefit', value: 'Less hesitation before irrigation, spraying, or harvest timing' },
  { label: 'Experience', value: 'Clear, mobile-friendly, and operationally calm' },
];

export function WhyAgroSmart() {
  return (
    <section id="why-agrosmart" data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="reason-grid gap-6">
        <div className="proof-card surface-panel px-6 py-8 sm:px-8">
          <span className="eyebrow">Why AgroSmart</span>
          <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Better operational confidence, without making the product feel heavy.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Many farming tools either stop at raw data or become too complex to use quickly. AgroSmart
            sits in the middle, strong enough to guide action, light enough to stay useful every day.
          </p>

          <div className="mt-8 space-y-4">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-start gap-4 rounded-[1.35rem] border border-slate-200/80 bg-white/85 px-5 py-4"
              >
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(143,207,108,0.22)] font-bold text-[var(--color-primary)]">
                  +
                </div>
                <p className="text-sm leading-7 text-slate-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <article className="reason-card interactive-card overflow-hidden surface-panel p-0">
            <div className="relative min-h-80">
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1400&q=80"
                alt="Farmer reviewing crop information outdoors"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.66)_100%)]" />
              <div className="relative flex h-full flex-col justify-end p-6 text-white">
                <div className="section-kicker !text-white/70">Field context</div>
                <h3 className="mt-3 text-2xl font-bold">A product story grounded in real farm work</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/84">
                  The interface feels stronger when it reflects the rhythm of observation, timing, and
                  action that defines work in the field.
                </p>
              </div>
            </div>
          </article>

          <article className="reason-card interactive-card bg-[linear-gradient(180deg,#123a30_0%,#145746_100%)] p-6 text-white shadow-[0_28px_70px_rgba(13,67,53,0.24)]">
            <div className="section-kicker !text-white/70">Operational fit</div>
            <h3 className="mt-3 text-2xl font-bold">A calmer way to move from insight to action</h3>
            <div className="mt-5 space-y-4">
              {evidence.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{item.label}</div>
                  <div className="mt-2 text-sm leading-7 text-white/84">{item.value}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
