const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why Agrimeteo', href: '#why-agrosmart' },
  { label: 'Preview', href: '#app-preview' },
  { label: 'Demo', href: '#demo-video' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-100">
            <img src="/logo.png" alt="Agrimeteo logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-[var(--color-primary)]">
              Agrimeteo
            </div>
            <div className="text-xs text-slate-500">Smart weather and farming insight</div>
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

        <div className="flex items-center gap-3">
          <a className="nav-link-button hidden sm:inline-flex" href="http://localhost:5173/login">
            Login
          </a>
          <a className="nav-cta" href="http://localhost:5173/register">
            Register
          </a>
        </div>
      </div>
    </header>
  );
}
