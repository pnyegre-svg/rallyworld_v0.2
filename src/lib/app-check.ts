
'use client';

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

let inited = false;
export function initAppCheck() {
  if (inited || typeof window === 'undefined') return;
  
  // For development environments, explicitly set the debug token flag to true.
  // This forces the SDK to generate and log a debug token in the browser console.
  if (process.env.NODE_ENV === 'development') {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_FB_APPCHECK_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  });
  inited = true;
}
