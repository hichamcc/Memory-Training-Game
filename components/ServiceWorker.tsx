'use client';

import { useEffect } from 'react';

/** Registers public/sw.js in production (in development it would cache stale code). */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is optional; the site works without it
    });
  }, []);
  return null;
}
