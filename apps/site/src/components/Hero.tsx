const stats = [
  { value: '10k+', label: 'farmers already using Agrimeteo' },
  { value: '24/7', label: 'advice and alerts for daily decisions' },
  { value: '30%', label: 'less waste with better planning' },
];

export function Hero() {
  return (
    <section
      data-reveal="hero"
      className="section-wrap reveal px-4 pb-18 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14"
    >
      <div className="hero-grid">
        <div className="pt-4">
          <span className="eyebrow">AI crop analysis from your phone</span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Manage your farm with better weather signals, clearer crop tracking, and
            one dashboard built for field reality.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Agrimeteo brings together crop monitoring, practical recommendations,
            localized weather, and quick farm actions so growers can plan faster and
            act with confidence.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="button-primary" href="http://localhost:5173/register">
              Start with Agrimeteo
            </a>
            <a className="button-secondary" href="http://localhost:5173/dashboard">
              Open dashboard
            </a>
            <a className="button-demo" href="#demo-video">
              Start demo
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <div className="text-2xl font-extrabold text-[var(--color-primary)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-10 top-10 h-64 rounded-full bg-[rgba(143,207,108,0.35)] blur-3xl" />
          <div className="phone-shell mx-auto max-w-sm p-5">
            <div className="phone-notch" />
            <div className="rounded-[2rem] bg-[linear-gradient(180deg,#f5fbf4_0%,#eaf7ec_100%)] p-5">
              <div className="floating-panel rounded-[1.75rem] bg-[linear-gradient(180deg,#155743_0%,#1f6e57_100%)] p-5 text-white">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Field summary</span>
                  <span>12:45</span>
                </div>
                <h2 className="mt-6 text-2xl font-bold">Hello, farmer.</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Rain is expected this afternoon. Irrigation can wait until tomorrow.
                </p>

                <div className="mt-6 rounded-2xl bg-white/14 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Weather alert</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Today</span>
                  </div>
                  <div className="mt-4 text-4xl font-extrabold">28 C</div>
                  <p className="mt-2 text-sm text-white/75">
                    Moderate rain near your maize plots in 2 hours.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white p-4 text-[var(--color-primary)]">
                    <div className="text-xs font-bold uppercase tracking-[0.18em]">
                      AI recommendation
                    </div>
                    <p className="mt-2 text-sm font-medium leading-6">
                      Delay spraying until the wind slows down this evening.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/14 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                      Crop health
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Tomato block A</span>
                      <span className="rounded-full bg-[rgba(143,207,108,0.24)] px-3 py-1 text-xs font-bold">
                        Healthy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
