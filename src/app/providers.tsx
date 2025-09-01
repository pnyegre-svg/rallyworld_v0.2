
'use client';
import { useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};

let booted = false;
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (booted) return;
    booted = true;

    // (A) set debug token BEFORE initializeAppCheck if you want to use it
    if (process.env.NEXT_PUBLIC_APPCHECK_DEBUG) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG;
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // (B) init App Check with the SAME reCAPTCHA v3 site key you configured in Firebase Console
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!),
      isTokenAutoRefreshEnabled: true,
    });

    // (C) warm the token to avoid the first-request race
    getToken(appCheck, true).catch(() => {});
  }, []);

  return <>{children}</>;
}
