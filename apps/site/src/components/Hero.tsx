import { ArrowRightIcon, LoginIcon, PlayIcon } from './Icons';
import { getAppUrl } from '../lib/appLinks';
import heroFieldImage from '../../../../image_culture/Blé.jpg';

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
      <div className="hero-stage overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_90px_rgba(13,51,40,0.16)]">
        <div
          className="hero-stage-media"
          style={{ backgroundImage: `url(${heroFieldImage})` }}
        />
        <div className="hero-stage-tint" />

        <div className="hero-grid-stage">
          <div className="hero-copy pt-4">
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              A sharper farming cockpit for weather, crop tracking, and next-step decisions.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/84 sm:text-lg">
              AgroSmart helps farmers move from uncertainty to action with local weather signals,
              crop follow-up, image-based diagnosis, and daily priorities gathered into one cleaner workflow.
            </p>

            <div className="hero-cta-row mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href={getAppUrl('/register')}>
                <ArrowRightIcon className="h-4 w-4" />
                Get started
              </a>
              <a className="button-secondary" href="#app-preview">
                <PlayIcon className="h-4 w-4" />
                See screens
              </a>
              <a className="button-ghost" href={getAppUrl('/login')}>
                <LoginIcon className="h-4 w-4" />
                Sign in
              </a>
            </div>

            <div className="hero-stats mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm leading-6 text-white/78">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
