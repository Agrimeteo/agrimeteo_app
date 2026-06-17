import { useEffect } from 'react';
import { CTA } from './components/CTA';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { Preview } from './components/Preview';
import { TrustStrip } from './components/TrustStrip';
import { WhyAgroSmart } from './components/WhyAgroSmart';

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

    elements.forEach((element) => {
      if (element.dataset.reveal === 'hero') {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            element.classList.add('is-visible');
          });
        });
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' },
    );

    elements.forEach((element) => {
      if (element.dataset.reveal !== 'hero') {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-slate-900">
      <div className="site-shell">
        <Navbar />
        <main>
          <Hero />
          <TrustStrip />
          <Features />
          <HowItWorks />
          <WhyAgroSmart />
          <Preview />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
