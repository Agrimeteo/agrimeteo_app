import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'agrosmart-install-dismissed';

const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const savedDismissal = window.localStorage.getItem(DISMISS_KEY) === 'true';
    setDismissed(savedDismissal);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setDismissed(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
      window.localStorage.setItem(DISMISS_KEY, 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const visible = useMemo(() => !dismissed && deferredPrompt !== null, [deferredPrompt, dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setInstalling(false);
    setDeferredPrompt(null);

    if (choice.outcome === 'dismissed') {
      return;
    }

    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, 'true');
  };

  const handleDismiss = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md rounded-2xl border border-primary/15 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
          <Download size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Installer AgroSmart</p>
          <p className="mt-1 text-sm text-slate-600">
            Ajoute l&apos;application sur ton appareil pour l&apos;ouvrir comme une vraie app, avec un accès plus rapide.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {installing ? 'Installation...' : 'Installer'}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstallAppPrompt;
