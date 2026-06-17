import { ScreenshotPlaceholder } from './ScreenshotPlaceholder';
import { getAppUrl } from '../lib/appLinks';

const stats = [
  { value: '10k+', label: 'growers reached across mobile-first workflows' },
  { value: '24/7', label: 'weather, crop, and diagnosis support in one flow' },
  { value: '3', label: 'core decisions clarified before work starts in the field' },
];

export function Hero() {
  return (
    <section
      data-reveal="hero"
      className="section-wrap reveal px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14"
    >
      <div className="hero-grid gap-10">
        <div className="pt-4">
          <span className="eyebrow">Built for field reality, not office admin</span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
            A sharper farming cockpit for weather, crop tracking, and next-step decisions.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            AgroSmart helps farmers move from uncertainty to action with local weather signals,
            crop follow-up, image-based diagnosis, and daily priorities gathered into one cleaner workflow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-primary" href={getAppUrl('/register')}>
              Create an account
            </a>
            <a className="button-secondary" href="#app-preview">
              Explore product preview
            </a>
            <a className="button-ghost" href={getAppUrl('/login')}>
              Open existing app
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="text-2xl font-extrabold text-[var(--color-primary)]">{stat.value}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="orb orb-primary" />
          <div className="orb orb-accent" />
          <div className="absolute left-0 top-6 z-10 rounded-full border border-white/70 bg-white/88 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[var(--color-primary)] shadow-[0_16px_32px_rgba(16,60,47,0.08)]">
            Live weather guidance
          </div>
          <div className="absolute bottom-20 right-2 z-10 rounded-full border border-white/70 bg-[rgba(15,59,48,0.92)] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white shadow-[0_18px_34px_rgba(13,51,40,0.18)]">
            Diagnosis workflow ready
          </div>

          <div className="shot-stack">
            <div className="screenshot-card screenshot-card-main floating-panel">
              <div className="screen-header">
                <div>
                  <div className="text-sm font-bold text-slate-900">Farmer dashboard capture</div>
                  <div className="mt-1 text-xs text-slate-500">Replace with your main app screenshot later</div>
                </div>
                <div className="screen-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="screen-preview screen-preview-hero">
                <ScreenshotPlaceholder
                  label="Hero screen"
                  title="Main dashboard screenshot"
                  copy="Drop in the strongest app capture here, ideally the screen that explains weather, crop progress, and recommendations at a glance."
                />
                <div className="screen-grid">
                  <div className="screen-block" />
                  <div className="screen-block-muted" />
                </div>
              </div>
            </div>

            <div className="screenshot-card screenshot-card-secondary">
              <div className="screen-header">
                <div className="screen-chip">Weather focus</div>
              </div>
              <div className="screen-preview">
                <ScreenshotPlaceholder
                  compact
                  label="Insert later"
                  title="Weather alerts screenshot"
                  copy="Use a real in-app weather or alert screen here."
                />
              </div>
            </div>

            <div className="screenshot-card screenshot-card-tertiary">
              <div className="screen-header">
                <div className="screen-chip">Diagnosis flow</div>
              </div>
              <div className="screen-preview">
                <ScreenshotPlaceholder
                  compact
                  label="Insert later"
                  title="Plant diagnosis screenshot"
                  copy="A scan result or AI recommendation screen works best in this slot."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
