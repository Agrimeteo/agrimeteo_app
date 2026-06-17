const proofPoints = [
  {
    title: 'Localized weather context',
    copy: 'Forecast signals that matter before irrigation, spraying, or travel decisions.',
  },
  {
    title: 'Diagnosis support on mobile',
    copy: 'A clearer path from plant image to practical next-step advice in the field.',
  },
  {
    title: 'Built for crop routines',
    copy: 'Less admin overhead, more focus on the actions that protect time and yield.',
  },
];

const cropTags = ['Maize', 'Cassava', 'Tomato', 'Plantain', 'Cocoa', 'Groundnut'];

export function TrustStrip() {
  return (
    <section data-reveal className="section-wrap reveal px-4 py-8 sm:px-6 lg:px-8">
      <div className="surface-panel rounded-[2rem] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-kicker">What the product is optimized for</div>
            <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">
              AgroSmart is strongest when weather, crop visibility, and diagnosis need to work together
              in one fast mobile workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
            {cropTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--color-line)] bg-white/82 px-3 py-2 text-xs font-semibold tracking-[0.08em] text-[var(--color-primary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {proofPoints.map((point, index) => (
            <article
              key={point.title}
              className="surface-panel-strong interactive-card rounded-[1.4rem] px-4 py-4"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="text-sm font-bold text-slate-900">{point.title}</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{point.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
