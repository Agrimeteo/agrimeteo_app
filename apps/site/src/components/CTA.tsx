import { AppleIcon, DashboardIcon, MailIcon, PlayIcon, PlayStoreIcon } from './Icons';

export function CTA() {
  return (
    <section data-reveal className="section-wrap reveal px-4 py-18 sm:px-6 lg:px-8">
      <div className="cta-panel px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="relative z-10 max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
            Ready to explore Agrimeteo
          </div>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Launch the app, create an account, and start from the existing frontend flow.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
            No auth logic was duplicated here. The landing page acts as a clean
            independent marketing entry point and hands users off to the app when they
            are ready.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-secondary" href="http://localhost:5173/login">
              <MailIcon className="mr-2 h-4 w-4" />
              Login
            </a>
            <a className="button-secondary" href="http://localhost:5173/register">
              <PlayIcon className="mr-2 h-4 w-4" />
              Register
            </a>
            <a className="button-secondary" href="http://localhost:5173/dashboard">
              <DashboardIcon className="mr-2 h-4 w-4" />
              Dashboard
            </a>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              className="button-store button-store-apple"
              href="#"
              aria-label="Download Agrimeteo on the App Store"
            >
              <AppleIcon className="button-store-icon h-6 w-6" />
              <span className="button-store-copy">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                  Download on
                </span>
                <span className="mt-1 text-base font-extrabold">App Store</span>
              </span>
            </a>
            <a
              className="button-store button-store-google"
              href="#"
              aria-label="Get Agrimeteo on Google Play"
            >
              <PlayStoreIcon className="button-store-icon h-6 w-6" />
              <span className="button-store-copy">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                  Get it on
                </span>
                <span className="mt-1 text-base font-extrabold">Google Play</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
