import { ScreenshotPlaceholder } from './ScreenshotPlaceholder';
import { ArrowRightIcon, LoginIcon } from './Icons';
import { getAppUrl } from '../lib/appLinks';

const previewCards = [
  {
    label: 'Screen 01',
    title: 'Dashboard screenshot',
    copy: 'Use the main decision screen here, ideally the one that shows alerts, crop summaries, and actions in one glance.',
  },
  {
    label: 'Screen 02',
    title: 'Diagnosis screenshot',
    copy: 'A diagnosis flow or AI recommendation view will communicate the product intelligence very quickly.',
  },
  {
    label: 'Screen 03',
    title: 'Weather screenshot',
    copy: 'A strong weather panel here will reinforce the forecasting angle and localized planning story.',
  },
];

export function Preview() {
  return (
    <section id="app-preview" data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="preview-grid gap-8">
        <div>
          <span className="eyebrow">Product preview</span>
          <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            The marketing site can stay elegant while the product itself does the convincing.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            This area is structured to receive real application screenshots. Once you provide them, the
            page can move from polished concept to much stronger proof.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-primary" href={getAppUrl('/login')}>
              <LoginIcon className="h-4 w-4" />
              Sign in
            </a>
            <a className="button-secondary" href={getAppUrl('/register')}>
              <ArrowRightIcon className="h-4 w-4" />
              Get started
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          {previewCards.map((card) => (
            <article key={card.title} className="preview-card surface-panel interactive-card">
              <div className="flex items-center justify-between gap-4">
                <div className="section-kicker">{card.label}</div>
                <div className="screen-chip">Ready for capture</div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</p>
              <div className="mt-5">
                <ScreenshotPlaceholder
                  label={card.label}
                  title={card.title}
                  copy="Replace this placeholder with a real in-app capture once you share the screenshot."
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
