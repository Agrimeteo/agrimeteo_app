import { ChartIcon, LeafIcon, MailIcon, MapPinIcon, PhoneIcon, ShareIcon } from './Icons';

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
              <div className="text-lg font-extrabold">Agrimeteo</div>
              <div className="text-sm text-slate-400">Smart weather and crop support for farmers</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Empowering the future of agriculture in Cameroon through innovation,
            accessibility, and technology.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-[var(--color-primary)]"
              href="#"
            >
              <ChartIcon className="h-4 w-4" />
            </a>
            <a
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-[var(--color-primary)]"
              href="#"
            >
              <ShareIcon className="h-4 w-4" />
            </a>
            <a
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-[var(--color-primary)]"
              href="#"
            >
              <MailIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Company
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300 flex flex-col">
            <a href="#">About Us</a>
            <a href="#">Our Mission</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Product
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300 flex flex-col">
            <a href="#features">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Success Stories</a>
            <a href="#">Help Center</a>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Contact
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>Douala, Cameroon</span>
            </div>
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>hello@agrimeteo.cm</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-[var(--color-secondary)]" />
              <span>+237 600 000 000</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 px-6 pt-8 text-center text-xs text-slate-500">
        <p>© 2024 Agrimeteo Technologies. All rights reserved. Designed for Cameroonian Farmers.</p>
      </div>
    </footer>
  );
}
