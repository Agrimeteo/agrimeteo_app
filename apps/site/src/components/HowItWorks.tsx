const steps = [
  {
    step: '1',
    title: 'Create an account',
    copy: 'Farmers can start from the app login and registration screens already exposed by the existing frontend.',
  },
  {
    step: '2',
    title: 'Set up crops and locations',
    copy: 'Add field information, crop details, and the context Agrimeteo needs to make useful recommendations.',
  },
  {
    step: '3',
    title: 'Follow daily recommendations',
    copy: 'Check alerts, monitor crop health, and take the next action from the dashboard when conditions change.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-reveal
      className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="section-card rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="max-w-3xl">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            A simple flow from onboarding to field action
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            This section was specifically requested and was missing. It explains the
            platform in a way that fits both mobile-first onboarding and field work.
          </p>
        </div>

        <div className="steps-grid mt-10">
          {steps.map((item) => (
            <article
              key={item.step}
              className="interactive-card rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6"
            >
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
