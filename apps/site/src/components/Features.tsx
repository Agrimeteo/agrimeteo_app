import { CloudIcon, DashboardIcon, LeafIcon, ScanIcon } from './Icons';

const features = [
  {
    title: 'One place for field priorities',
    copy:
      'Start the day with a clean summary of crop progress, warnings, and decisions that should happen before conditions shift.',
    icon: DashboardIcon,
  },
  {
    title: 'Localized weather guidance',
    copy:
      'Track rain, wind, and temperature changes with context that helps farmers decide when to irrigate, spray, move, or wait.',
    icon: CloudIcon,
  },
  {
    title: 'Crop follow-up that stays simple',
    copy:
      'Store field notes, crop stages, and routine observations without turning the product into a heavy management system.',
    icon: LeafIcon,
  },
  {
    title: 'Image-based diagnosis support',
    copy:
      'Help farmers spot crop issues earlier and move faster from observation to next-step advice directly on mobile.',
    icon: ScanIcon,
  },
];

export function Features() {
  return (
    <section id="features" data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <span className="eyebrow">Core capabilities</span>
        <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
          Designed to help real farm work move faster, calmer, and with better timing.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          The product is strongest when it reduces scattered decision-making. Every major feature is
          there to cut friction between weather, observation, and action.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className={`feature-card surface-panel interactive-card ${
              index === 0 ? 'flex flex-col justify-between' : ''
            }`}
          >
            <div className="feature-body">
              <div className="icon-badge">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.copy}</p>
            </div>

            {index === 0 && (
              <div className="mt-6 rounded-[1.35rem] border border-[var(--color-line)] bg-white/75 p-4">
                <div className="section-kicker">Why this matters</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The most useful farm product is not the one with the most screens. It is the one that
                  clarifies the next move before time, weather, or attention is lost.
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
