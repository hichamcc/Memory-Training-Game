'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

// Chrome's install prompt event (not in TypeScript's DOM types yet)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'installed' | 'ios' | 'other';

function getPlatform(): Platform {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return 'installed';
  // iPadOS reports itself as a Mac, but Macs have no touch screen
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios ? 'ios' : 'other';
}

const noSubscribe = () => () => {};

/** "Add to your home screen" card: a button where the browser supports it, instructions on iPhone. */
export default function InstallApp() {
  const platform = useSyncExternalStore(noSubscribe, getPlatform, () => 'installed' as Platform);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || platform === 'installed') return null;
  if (platform !== 'ios' && !prompt) return null;

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  return (
    <section
      aria-labelledby="install-app"
      className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5"
    >
      <div className="text-3xl" aria-hidden="true">📲</div>
      <div className="flex-1">
        <h2 id="install-app" className="font-bold text-slate-900">Get the app</h2>
        {platform === 'ios' ? (
          <p className="text-sm text-slate-600">
            Tap the <span className="font-semibold">Share</span> button in Safari, then{' '}
            <span className="font-semibold">Add to Home Screen</span>. All the games open from your home screen, full
            screen, like an app.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Install Memory Champions on your device. All the games open from your home screen, full screen, like an app.
          </p>
        )}
      </div>
      {platform !== 'ios' && (
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center justify-center min-h-[44px] rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Install app
        </button>
      )}
    </section>
  );
}
