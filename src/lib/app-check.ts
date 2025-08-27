'use client';

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

export function initAppCheck() {
  if (typeof window === 'undefined') return;            // SSR guard
  if ((window as any).__appCheckInited) return;         // init once

  // For localhost, set a debug token in .env.local (or use true to auto-generate in console)
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
    process.env.NEXT_PUBLIC_FB_APPCHECK_DEBUG_TOKEN || undefined;

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!  // from Firebase App Check
    ),
    isTokenAutoRefreshEnabled: true,
  });

  (window as any).__appCheckInited = true;
}