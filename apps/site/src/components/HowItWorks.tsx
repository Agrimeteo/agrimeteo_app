const steps = [
  {
    step: '1',
    title: 'Set up the farmer context',
    copy:
      'Create an account, define the grower role, and add the locations or crop entries that make recommendations more relevant.',
  },
  {
    step: '2',
    title: 'Watch the signals that matter',
    copy:
      'Use the dashboard to review crop progress, incoming weather changes, and alerts that could affect field work today.',
  },
  {
    step: '3',
    title: 'Turn recommendations into action',
    copy:
      'Use diagnosis support, crop notes, and timing suggestions to take the next decision with more clarity and less delay.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="surface-panel rounded-[2.1rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="max-w-3xl">
          <span className="eyebrow">From signup to field action</span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            A short, practical flow instead of a bloated product tour.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            AgroSmart works best when the path stays simple: set the context, observe what changed, then
            act on the recommendation that matters now.
          </p>
        </div>

        <div className="steps-grid mt-10">
          {steps.map((item) => (
            <article key={item.step} className="timeline-card surface-panel-strong interactive-card">
              <div className="step-number">{item.step}</div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
