const reasons = [
  'Built around farm routines, not generic admin workflows',
  'Balanced for fast mobile use and clear decision support',
  'Keeps a strong green identity while staying readable and modern',
];

export function WhyAgroSmart() {
  return (
    <section
      id="why-agrosmart"
      data-reveal
      className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="reason-grid">
        <div className="section-card rounded-[2rem] px-6 py-8 sm:px-8">
          <span className="eyebrow">Why Agrimeteo</span>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Better decisions without adding complexity
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The original HTML had strong visual intent, but it did not fully map to the
            requested sections. This version makes the product story explicit and keeps
            the responsive layout clean on desktop and mobile.
          </p>

          <div className="mt-8 space-y-4">
            {reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-start gap-4 rounded-[1.25rem] border border-slate-200/80 bg-white/85 px-5 py-4"
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
          <article className="reason-card section-card interactive-card">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              App value
            </div>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">From insight to action</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Weather warnings, crop data, and follow-up actions live in one product
              flow, which makes it easier to react quickly during the day.
            </p>
          </article>

          <article className="reason-card interactive-card bg-[linear-gradient(180deg,#135c49_0%,#0d4335_100%)] text-white shadow-[0_24px_70px_rgba(13,67,53,0.25)]">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
              Operational fit
            </div>
            <h3 className="mt-3 text-2xl font-bold">Ready to connect with the app routes</h3>
            <p className="mt-3 text-sm leading-7 text-white/78">
              Login, register, and dashboard calls now point to the existing app on
              localhost so the site stays a separate entry point without duplicating auth logic.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
