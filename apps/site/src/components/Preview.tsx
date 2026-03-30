const previewCards = [
  {
    title: 'Daily dashboard',
    copy: 'See urgent crop tasks, weather trends, and farm health from one starting point.',
  },
  {
    title: 'Plant diagnosis',
    copy: 'Capture a plant image and move from detection to treatment suggestions faster.',
  },
  {
    title: 'Weather panel',
    copy: 'Keep localized temperature, wind, and humidity visible before key field actions.',
  },
];

export function Preview() {
  return (
    <section
      id="app-preview"
      data-reveal
      className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="preview-grid gap-8">
        <div>
          <span className="eyebrow">App preview</span>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            A landing page that points directly to the product
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            The site stays independent, but every primary conversion path now points to
            the app routes already present in apps/app.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-primary" href="http://localhost:5173/login">
              Go to login
            </a>
            <a className="button-secondary" href="http://localhost:5173/register">
              Create account
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          {previewCards.map((card, index) => (
            <article
              key={card.title}
              className="preview-card section-card interactive-card rounded-[1.75rem] border border-white/70"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Screen 0{index + 1}
                </div>
                <div className="rounded-full bg-[rgba(19,92,73,0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  Preview
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</p>
              <div className="mt-5 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(19,92,73,0.95)_0%,rgba(143,207,108,0.75)_100%)] p-5 text-white">
                <div className="text-xs uppercase tracking-[0.18em] text-white/72">
                  Agrimeteo
                </div>
                <div className="mt-2 text-lg font-bold">{card.title}</div>
                <div className="mt-2 text-sm text-white/80">
                  Designed as a simple mobile-first workflow for field decisions.
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        id="demo-video"
        data-reveal
        className="reveal section-card mt-10 overflow-hidden rounded-[2rem] border border-white/70"
      >
        <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div>
            <span className="eyebrow">Start demo</span>
            <h3 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Demo video placeholder ready for your walkthrough
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              The button is now present and points here. When your video is ready, we can
              replace this placeholder with an embedded player or modal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="button-primary">
                Start demo
              </button>
              <span className="inline-flex items-center rounded-full bg-[rgba(19,92,73,0.08)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                Video coming soon
              </span>
            </div>
          </div>
          <div className="interactive-card flex min-h-72 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(19,92,73,0.95)_0%,rgba(143,207,108,0.68)_100%)] p-6 text-white">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/12 text-2xl font-bold backdrop-blur-sm">
                Play
              </div>
              <div className="mt-5 text-xl font-bold">Agrimeteo Product Demo</div>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">
                Add your explanatory video later and keep this section as the launch point.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
