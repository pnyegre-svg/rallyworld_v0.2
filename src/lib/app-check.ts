
'use client';

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

let inited = false;
export function initAppCheck() {
  if (inited || typeof window === 'undefined') return;
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
    process.env.NEXT_PUBLIC_FB_APPCHECK_DEBUG_TOKEN || undefined;

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  });
  inited = true;
}
