import { useState } from 'react';
import { getAppUrl } from '../lib/appLinks';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why AgroSmart', href: '#why-agrosmart' },
  { label: 'Product preview', href: '#app-preview' },
  { label: 'Launch', href: '#launch' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-950/15 ring-1 ring-emerald-100">
              <img src="/logo.png" alt="AgroSmart logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-[var(--color-primary)]">
                AgroSmart
              </div>
              <div className="text-xs text-slate-500">Field intelligence for faster farming decisions</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:text-[var(--color-primary)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a className="nav-link-button" href={getAppUrl('/login')}>
              Sign in
            </a>
            <a className="nav-cta" href={getAppUrl('/register')}>
              Launch AgroSmart
            </a>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white/82 text-[var(--color-primary)] shadow-sm md:hidden"
          >
            <span className="text-xl leading-none">{menuOpen ? '×' : '+'}</span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.34)] backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <div
        className={`fixed inset-x-4 top-[5.25rem] z-50 rounded-[1.8rem] border border-white/70 bg-white/94 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 md:hidden ${
          menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <div className="section-kicker">Navigation</div>
        <nav className="mt-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-[1.2rem] border border-[var(--color-line)] bg-white/84 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-4 grid gap-3">
          <a className="button-secondary w-full" href={getAppUrl('/login')} onClick={() => setMenuOpen(false)}>
            Sign in
          </a>
          <a className="button-primary w-full" href={getAppUrl('/register')} onClick={() => setMenuOpen(false)}>
            Launch AgroSmart
          </a>
        </div>
      </div>
    </>
  );
}
