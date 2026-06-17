import { LeafIcon, MailIcon, MapPinIcon, PhoneIcon } from './Icons';
import { getAppUrl } from '../lib/appLinks';

export function Footer() {
  return (
    <footer className="section-wrap px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="footer-grid rounded-[2rem] border border-white/70 bg-[rgba(15,23,42,0.96)] px-6 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white ring-1 ring-white/10">
              <LeafIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold">AgroSmart</div>
              <div className="text-sm text-slate-400">Weather, diagnosis, and crop support in one product</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Built to help farmers in Cameroon work with better timing, clearer recommendations, and a
            more practical view of what should happen next.
          </p>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Explore</div>
          <div className="mt-5 flex flex-col space-y-3 text-sm text-slate-300">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#app-preview">Product preview</a>
            <a href="#launch">Launch</a>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Product</div>
          <div className="mt-5 flex flex-col space-y-3 text-sm text-slate-300">
            <a href={getAppUrl('/login')}>Sign in</a>
            <a href={getAppUrl('/register')}>Create account</a>
            <a href={getAppUrl('/weather')}>Weather</a>
            <a href={getAppUrl('/community')}>Community</a>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Contact</div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>Douala, Cameroon</span>
            </div>
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>contact@agrosmart.cm</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>+237 672 170 259</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 px-6 pt-8 text-center text-xs text-slate-500">
        <p>© 2026 AgroSmart Technologies. Built for Cameroonian farmers and modern field operations.</p>
      </div>
    </footer>
  );
}
