'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator }from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID!,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Singletons (instances, not functions) ✅
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

const region = process.env.NEXT_PUBLIC_FB_FUNCTIONS_REGION || 'europe-central2';
export const fns = getFunctions(app, region);

if (process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === 'true') {
    connectFunctionsEmulator(fns, 'localhost', 5001);
}

// (Optional) ensure App Check is initialized on the client
if (typeof window !== 'undefined') {
  // Debug token can be provided via env if needed
  if (process.env.NEXT_PUBLIC_APPCHECK_DEBUG) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  });
}
