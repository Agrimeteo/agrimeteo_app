import { DashboardIcon, MailIcon, PlayIcon } from './Icons';
import { getAppUrl } from '../lib/appLinks';

export function CTA() {
  return (
    <section id="launch" data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="cta-panel px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="relative z-10 max-w-3xl">
          <div className="section-kicker !text-white/68">Ready to launch</div>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            Move from the website into the product when you are ready to act, not just browse.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
            AgroSmart is already structured around a working app flow. The website should create trust,
            then hand users into the live product with as little friction as possible.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-secondary" href={getAppUrl('/login')}>
              <MailIcon className="h-4 w-4" />
              Sign in
            </a>
            <a className="button-secondary" href={getAppUrl('/register')}>
              <PlayIcon className="h-4 w-4" />
              Create account
            </a>
            <a className="button-secondary" href={getAppUrl('/farmer-dashboard')}>
              <DashboardIcon className="h-4 w-4" />
              Open dashboard
            </a>
          </div>

          <div className="mt-8 max-w-2xl rounded-[1.4rem] border border-white/12 bg-white/8 px-5 py-5 text-sm leading-7 text-white/74">
            When you share the final app screenshots, this final panel can also become a stronger launch
            section with a featured screen, testimonial, or store badge row.
          </div>
        </div>
      </div>
    </section>
  );
}
