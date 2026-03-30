import { CloudIcon, DashboardIcon, LeafIcon, ScanIcon } from './Icons';

const features = [
  {
    title: 'Crop monitoring',
    copy: 'Track field condition, crop stages, and daily priorities without digging through multiple screens.',
    icon: LeafIcon,
  },
  {
    title: 'Weather alerts',
    copy: 'Get local signals that help you plan irrigation, spraying, harvest timing, and travel.',
    icon: CloudIcon,
  },
  {
    title: 'Plant diagnosis',
    copy: 'Use image-based support to spot issues early and avoid losing time on slow manual checks.',
    icon: ScanIcon,
  },
  {
    title: 'Actionable dashboard',
    copy: 'See the next decisions to make from one place instead of hopping between tools and notes.',
    icon: DashboardIcon,
  },
];

export function Features() {
  return (
    <section
      id="features"
      data-reveal
      className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8"
    >
      <div className="mb-10 max-w-3xl">
        <span className="eyebrow">Features</span>
        <h2 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Key tools for daily farm management
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          The landing page now reflects the product more clearly with the main value
          propositions that were requested in the original prompt.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card section-card interactive-card">
            <div className="icon-badge">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
